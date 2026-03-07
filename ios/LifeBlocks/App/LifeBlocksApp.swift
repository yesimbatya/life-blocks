import SwiftUI

@main
struct LifeBlocksApp: App {
    @StateObject private var store = BlockStore()
    @StateObject private var healthManager = HealthManager()
    @StateObject private var screenTime = MockScreenTime()

    var body: some Scene {
        WindowGroup {
            HomeView()
                .environmentObject(store)
                .environmentObject(healthManager)
                .environmentObject(screenTime)
        }
    }
}
