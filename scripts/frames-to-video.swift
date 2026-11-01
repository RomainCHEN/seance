// Assemble a PNG frame sequence into an H.264 MP4 with AVFoundation.
//
//   swift scripts/frames-to-video.swift <frames-dir> <out.mp4> [fps]
//
// Used because this machine has no ffmpeg; AVFoundation is already installed.
import AVFoundation
import AppKit
import Foundation

let args = CommandLine.arguments
guard args.count >= 3 else {
    print("usage: frames-to-video.swift <frames-dir> <out.mp4> [fps]")
    exit(1)
}

let framesDir = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])
let fps = args.count > 3 ? Int32(args[3])! : 4

let files = try FileManager.default
    .contentsOfDirectory(atPath: framesDir.path)
    .filter { $0.hasSuffix(".png") }
    .sorted()

// Optional real-time timestamps: one JSON object per line {"i":0,"ms":1234}
var timestamps: [Int: Int] = [:]
if let raw = try? String(contentsOf: framesDir.appendingPathComponent("timestamps.jsonl"), encoding: .utf8) {
    for line in raw.split(separator: "\n") {
        guard let data = line.data(using: .utf8),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Int],
              let i = obj["i"], let ms = obj["ms"] else { continue }
        timestamps[i] = ms
    }
    print("loaded \(timestamps.count) timestamps (real-time playback)")
}

guard let firstFile = files.first,
      let firstImage = NSImage(contentsOfFile: framesDir.appendingPathComponent(firstFile).path)
else {
    print("no frames found in \(framesDir.path)")
    exit(1)
}

let width = Int(firstImage.size.width)
let height = Int(firstImage.size.height)
print("encoding \(files.count) frames at \(width)x\(height), \(fps) fps")

try? FileManager.default.removeItem(at: outputURL)
let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 4_000_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    ],
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: input,
    sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
        kCVPixelBufferWidthKey as String: width,
        kCVPixelBufferHeightKey as String: height,
    ]
)
writer.add(input)
guard writer.startWriting() else {
    print("startWriting failed: \(String(describing: writer.error))")
    exit(1)
}
writer.startSession(atSourceTime: .zero)

let colorSpace = CGColorSpaceCreateDeviceRGB()
var index: Int32 = 0

for file in files {
    let path = framesDir.appendingPathComponent(file).path
    guard let image = NSImage(contentsOfFile: path),
          let tiff = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiff),
          let cgImage = bitmap.cgImage
    else { continue }

    guard let pool = adaptor.pixelBufferPool else { break }
    var pixelBuffer: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
    guard let buffer = pixelBuffer else { continue }

    CVPixelBufferLockBaseAddress(buffer, [])
    if let context = CGContext(
        data: CVPixelBufferGetBaseAddress(buffer),
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
    ) {
        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    }
    CVPixelBufferUnlockBaseAddress(buffer, [])

    let presentation: CMTime
    if let ms = timestamps[Int(index)] {
        presentation = CMTime(value: CMTimeValue(ms), timescale: 1000)
    } else {
        presentation = CMTime(value: CMTimeValue(index), timescale: fps)
    }

    while !input.isReadyForMoreMediaData { usleep(5_000) }
    if !adaptor.append(buffer, withPresentationTime: presentation) {
        print("append failed at frame \(index): \(String(describing: writer.error))")
        break
    }
    index += 1
}

input.markAsFinished()
let semaphore = DispatchSemaphore(value: 0)
writer.finishWriting { semaphore.signal() }
semaphore.wait()

if writer.status == .completed {
    let seconds = timestamps.isEmpty ? Double(index) / Double(fps) : Double(timestamps.values.max() ?? 0) / 1000.0
    print(String(format: "wrote %@ (%.1f s, %d frames)", outputURL.path, seconds, index))
} else {
    print("finish failed: \(String(describing: writer.error))")
    exit(1)
}
