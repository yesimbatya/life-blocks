import SwiftUI

@main
struct LifeBlocksApp: App {
    @StateObject private var store = BlockStore()
    @StateObject private var settingsStore = SettingsStore()
    @StateObject private var healthManager = HealthManager()
    @StateObject private var screenTime = MockScreenTime()

    var body: some Scene {
        WindowGroup {
            Group {
                if settingsStore.settings.onboardingComplete {
                    TabView {
                        HomeView()
                            .tabItem {
                                Image(systemName: "chart.line.uptrend.xyaxis")
                                Text("Today")
                            }

                        HistoryView()
                            .tabItem {
                                Image(systemName: "calendar")
                                Text("History")
                            }

                        SettingsView()
                            .tabItem {
                                Image(systemName: "gearshape.fill")
                                Text("Settings")
                            }
                    }
                } else {
                    OnboardingView()
                }
            }
            .environmentObject(store)
            .environmentObject(settingsStore)
            .environmentObject(healthManager)
            .environmentObject(screenTime)
        }
    }
}
