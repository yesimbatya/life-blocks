import SwiftUI
import WidgetKit

struct HomeView: View {
    @EnvironmentObject var store: BlockStore
    @EnvironmentObject var settingsStore: SettingsStore
    @EnvironmentObject var healthManager: HealthManager
    @State private var showBlockGrid = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    ScoreCardView()
                    HealthInsightView()
                    PortfolioView()
                }
                .padding(.horizontal)
                .padding(.bottom, 100)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Today")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showBlockGrid = true
                    } label: {
                        Image(systemName: "calendar")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showBlockGrid) {
                BlockGridView()
            }
            .safeAreaInset(edge: .bottom) {
                Button {
                    showBlockGrid = true
                } label: {
                    Label("Schedule Your Day", systemImage: "calendar")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding(.horizontal)
                .padding(.bottom, 8)
                .background(.ultraThinMaterial)
            }
        }
        .onChange(of: store.blocks) { _, _ in
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
}
