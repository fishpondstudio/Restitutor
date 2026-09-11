// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.5.2"),
        .package(name: "CapacitorFilesystem", path: "../../../../../node_modules/.pnpm/@capacitor+filesystem@8.1.3_@capacitor+core@8.5.2/node_modules/@capacitor/filesystem"),
        .package(name: "CapawesomeCapacitorLiveUpdate", path: "../../../../../node_modules/.pnpm/@capawesome+capacitor-live-_7a1ae831cad9398fc934af218960e87a/node_modules/@capawesome/capacitor-live-update")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapawesomeCapacitorLiveUpdate", package: "CapawesomeCapacitorLiveUpdate")
            ]
        )
    ]
)
