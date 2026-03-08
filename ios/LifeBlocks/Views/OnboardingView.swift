import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var settingsStore: SettingsStore
    @State private var currentPage = 0

    private let pages: [(emoji: String, title: String, subtitle: String, description: String)] = [
        ("📊", "Life Blocks", "Invest your time like a portfolio",
         "Think of your day as a portfolio of investments. Allocate your time wisely and watch your returns compound."),
        ("🧱", "100 Blocks a Day", "You have 16.6 waking hours",
         "Each block is 10 minutes. You have exactly 100 blocks from 6 AM to 10:40 PM. How will you invest them?"),
        ("💎", "Three Categories", "Blue Chips, Growth & Drains",
         "Blue Chips are essentials like sleep and exercise. Growth habits build your future. Drains cost you returns."),
        ("🔥", "Streaks Compound", "Consistency multiplies returns",
         "Every consecutive day increases your multiplier. A 7-day streak nearly doubles your returns. Stay consistent."),
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Skip button
            HStack {
                Spacer()
                Button("Skip") {
                    settingsStore.completeOnboarding()
                }
                .foregroundStyle(.secondary)
                .font(.callout.weight(.medium))
                .padding()
            }

            Spacer()

            // Content
            TabView(selection: $currentPage) {
                ForEach(0..<pages.count, id: \.self) { index in
                    VStack(spacing: 16) {
                        Text(pages[index].emoji)
                            .font(.system(size: 72))
                            .padding(.bottom, 8)

                        Text(pages[index].title)
                            .font(.system(size: 28, weight: .bold))
                            .multilineTextAlignment(.center)

                        Text(pages[index].subtitle)
                            .font(.callout.weight(.semibold))
                            .foregroundStyle(.blue)
                            .multilineTextAlignment(.center)

                        Text(pages[index].description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut, value: currentPage)

            Spacer()

            // Bottom controls
            VStack(spacing: 20) {
                // Progress dots
                HStack(spacing: 8) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        Capsule()
                            .fill(index == currentPage ? Color.blue : Color(.systemGray4))
                            .frame(width: index == currentPage ? 24 : 8, height: 8)
                            .animation(.spring(response: 0.3), value: currentPage)
                    }
                }

                // Action button
                Button {
                    if currentPage == pages.count - 1 {
                        settingsStore.completeOnboarding()
                    } else {
                        withAnimation {
                            currentPage += 1
                        }
                    }
                } label: {
                    Text(currentPage == pages.count - 1 ? "Get Started" : "Continue")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding(.horizontal, 32)
            }
            .padding(.bottom, 48)
        }
    }
}
