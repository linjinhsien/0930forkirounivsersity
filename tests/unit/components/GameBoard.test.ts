import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import GameBoard from '@/components/game/GameBoard.vue'

// ---------------------------------------------------------------------------
// Store mocks
// ---------------------------------------------------------------------------

const mockLoadCardLibrary = vi.fn().mockResolvedValue([])
const mockInitializeGame = vi.fn().mockResolvedValue(undefined)
const mockPlaceCard = vi.fn().mockReturnValue(true)
const mockRemoveCard = vi.fn()
const mockSubmitSolution = vi.fn()
const mockSetValidationState = vi.fn()

const baseGameStore = {
  gameState: null as null | { status: string; slots: unknown[]; hand: unknown[] },
  isGameActive: false,
  validationResult: null,
  isValidating: false,
  currentScenario: null,
  placedCards: [] as unknown[],
  currentScore: {
    highAvailability: 0,
    costEffectiveness: 0,
    securityCompliance: 0,
    total: 0,
    breakdown: {
      requirementsMet: 0,
      totalRequirements: 0,
      costUtilization: 0,
      synergyBonuses: [] as unknown[],
      penalties: [] as unknown[],
    },
  },
  initializeGame: mockInitializeGame,
  placeCard: mockPlaceCard,
  removeCard: mockRemoveCard,
  submitSolution: mockSubmitSolution,
  setValidationState: mockSetValidationState,
}

// Mutable store state so individual tests can override it
let gameStoreMock = { ...baseGameStore }

vi.mock('@/stores/game', () => ({
  useGameStore: () => gameStoreMock,
}))

vi.mock('@/stores/codex', () => ({
  useCodexStore: () => ({
    cardLibrary: [] as unknown[],
    scenarioLibrary: [] as unknown[],
    searchResults: [] as unknown[],
    isLoading: false,
    loadCardLibrary: mockLoadCardLibrary,
    filterByDomain: vi.fn(),
    totalCards: 0,
  }),
}))

// ---------------------------------------------------------------------------
// Stub heavy child components to keep tests fast and focused on GameBoard itself
// ---------------------------------------------------------------------------

vi.mock('@/components/game/TimerBar.vue', () => ({
  default: defineComponent({
    name: 'TimerBar',
    props: ['timeRemaining', 'totalTime'],
    emits: ['timeExpired', 'warningTriggered'],
    setup() {
      return () => h('div', { 'data-testid': 'timer-bar' }, 'TimerBar')
    },
  }),
}))

vi.mock('@/components/game/ScenarioPanel.vue', () => ({
  default: defineComponent({
    name: 'ScenarioPanel',
    props: ['scenario', 'placedCardCount'],
    setup() {
      return () => h('div', { 'data-testid': 'scenario-panel' }, 'ScenarioPanel')
    },
  }),
}))

vi.mock('@/components/game/CardDeck.vue', () => ({
  default: defineComponent({
    name: 'CardDeck',
    props: ['cards', 'selectedCardId'],
    emits: ['cardSelected', 'cardDragStart'],
    setup() {
      return () => h('div', { 'data-testid': 'card-deck' }, 'CardDeck')
    },
  }),
}))

vi.mock('@/components/game/ScoreDisplay.vue', () => ({
  default: defineComponent({
    name: 'ScoreDisplay',
    props: ['score'],
    setup() {
      return () => h('div', { 'data-testid': 'score-display' }, 'ScoreDisplay')
    },
  }),
}))

vi.mock('@/components/game/ValidationFeedback.vue', () => ({
  default: defineComponent({
    name: 'ValidationFeedback',
    props: ['result', 'isValidating'],
    setup() {
      return () => h('div', { 'data-testid': 'validation-feedback' }, 'ValidationFeedback')
    },
  }),
}))

vi.mock('@/components/board/ArchitectureSlot.vue', () => ({
  default: defineComponent({
    name: 'ArchitectureSlot',
    props: ['architectureSlot', 'isHighlighted'],
    emits: ['cardDropped', 'cardRemoved', 'slotClicked'],
    setup() {
      return () => h('div', { 'data-testid': 'architecture-slot' }, 'Slot')
    },
  }),
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GameBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store mock to default (inactive game) before each test
    gameStoreMock = { ...baseGameStore }
    mockLoadCardLibrary.mockResolvedValue([])
    mockInitializeGame.mockResolvedValue(undefined)
  })

  it('renders without errors with mode="quick-match"', () => {
    const { container } = render(GameBoard, {
      props: { mode: 'quick-match' },
    })
    expect(container.firstChild).toBeTruthy()
  })

  it('renders the TimerBar component', () => {
    const { getByTestId } = render(GameBoard, {
      props: { mode: 'quick-match' },
    })
    expect(getByTestId('timer-bar')).toBeTruthy()
  })

  it('shows the submit button when the game is active', () => {
    // Override store mock to simulate an active game
    gameStoreMock = {
      ...baseGameStore,
      isGameActive: true,
      gameState: { status: 'playing', slots: [], hand: [] },
      placedCards: [],
    }

    const { getByRole } = render(GameBoard, {
      props: { mode: 'quick-match' },
    })

    const submitBtn = getByRole('button', { name: /submit solution/i })
    expect(submitBtn).toBeTruthy()
  })

  it('calls loadCardLibrary on mount', async () => {
    render(GameBoard, { props: { mode: 'quick-match' } })

    // Allow the async onMounted to run
    await vi.waitFor(() => {
      expect(mockLoadCardLibrary).toHaveBeenCalledTimes(1)
    })
  })

  it('renders the scenario panel area (aside landmark)', () => {
    const { getAllByRole } = render(GameBoard, {
      props: { mode: 'quick-match' },
    })

    // GameBoard has two <aside> elements: scenario (left) and score/validation (right)
    const asides = getAllByRole('complementary')
    expect(asides.length).toBeGreaterThanOrEqual(1)

    // The first aside has the aria-label "Scenario details"
    expect(asides[0].getAttribute('aria-label')).toBe('Scenario details')
  })

  it('renders a labelled game board container', () => {
    const { getByLabelText } = render(GameBoard, {
      props: { mode: 'quick-match' },
    })
    const board = getByLabelText('Game board')
    expect(board).toBeTruthy()
    expect(board.tagName).toBe('DIV')
  })

  it('does not show submit button when game is NOT active', () => {
    // Default mock has isGameActive: false
    const { queryByRole } = render(GameBoard, {
      props: { mode: 'quick-match' },
    })
    expect(queryByRole('button', { name: /submit solution/i })).toBeNull()
  })

  it('shows loading placeholder when there is no scenario', () => {
    // currentScenario is null in default mock
    const { container } = render(GameBoard, {
      props: { mode: 'quick-match' },
    })
    const placeholder = container.querySelector('[aria-busy="true"]')
    expect(placeholder).toBeTruthy()
    expect(placeholder?.getAttribute('aria-label')).toContain('Loading scenario')
  })
})
