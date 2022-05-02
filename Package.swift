// swift-tools-version: 5.6
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "TreeSitterRTF",
    products: [
        .library(
            name: "TreeSitterRTF",
            targets: ["TreeSitterRTF"]
        ),
    ],
    dependencies: [ ],
    targets: [
        .target(
            name: "TreeSitterRTF",
            dependencies: [],
            path: "src",
            publicHeadersPath: ""
        ),
    ]
)
