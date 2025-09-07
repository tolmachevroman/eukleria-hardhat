const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const LOCALHOST_TEXT_TEXT = '\x1b[38;5;0m';
const ETHEREUM_TEXT_TEXT = '\x1b[38;5;237m';
const POLYGON_TEXT_TEXT = '\x1b[38;5;255m';
const LINEA_TEXT_TEXT = '\x1b[38;5;231m';
const OP_TEXT_TEXT = '\x1b[38;5;231m';
const AVALANCHE_TEXT_TEXT = '\x1b[38;5;231m';
const BASE_TEXT_TEXT = '\x1b[38;5;231m';
const ARBITRUM_TEXT_TEXT = '\x1b[38;5;231m';

const LOCALHOST_BACKGROUND_COLOR = '\x1b[48;5;221m';
const ETHEREUM_BACKGROUND_COLOR = '\x1b[48;5;110m';
const POLYGON_BACKGROUND_COLOR = '\x1b[48;5;104m';
const LINEA_BACKGROUND_COLOR = '\x1b[48;5;240m';
const OP_BACKGROUND_COLOR = '\x1b[48;5;160m';
const AVALANCHE_BACKGROUND_COLOR = '\x1b[48;5;196m';
const BASE_BACKGROUND_COLOR = '\x1b[48;5;33m';
const ARBITRUM_BACKGROUND_COLOR = '\x1b[48;5;74m';

function getColorScheme(network: string): { backgroundColor: string; textColor: string } {
  switch (network) {
    case 'localhost':
      return { backgroundColor: LOCALHOST_BACKGROUND_COLOR, textColor: LOCALHOST_TEXT_TEXT };
    case 'polygonAmoy':
      return { backgroundColor: POLYGON_BACKGROUND_COLOR, textColor: POLYGON_TEXT_TEXT };
    case 'lineaSepolia':
      return { backgroundColor: LINEA_BACKGROUND_COLOR, textColor: LINEA_TEXT_TEXT };
    case 'optimismSepolia':
      return { backgroundColor: OP_BACKGROUND_COLOR, textColor: OP_TEXT_TEXT };
    case 'avalancheFuji':
      return { backgroundColor: AVALANCHE_BACKGROUND_COLOR, textColor: AVALANCHE_TEXT_TEXT };
    case 'baseSepolia':
      return { backgroundColor: BASE_BACKGROUND_COLOR, textColor: BASE_TEXT_TEXT };
    case 'arbitrumSepolia':
      return { backgroundColor: ARBITRUM_BACKGROUND_COLOR, textColor: ARBITRUM_TEXT_TEXT };
    default:
      return { backgroundColor: ETHEREUM_BACKGROUND_COLOR, textColor: ETHEREUM_TEXT_TEXT };
  }
}

function showMessage(network: string, message: string, icon: string) {
  const { backgroundColor, textColor } = getColorScheme(network);

  const totalWidth = 85;
  const padding = totalWidth - message.length - 6; // 6 accounts for the borders and spaces

  const paddedBalanceText = message + ' '.repeat(Math.max(padding, 0));

  console.log(`${backgroundColor}${textColor}${BOLD} ┌${'─'.repeat(totalWidth - 2)}┐ ${RESET}`);
  console.log(`${backgroundColor}${textColor}${BOLD} │ ${icon} ${paddedBalanceText}│ ${RESET}`);
  console.log(`${backgroundColor}${textColor}${BOLD} └${'─'.repeat(totalWidth - 2)}┘ ${RESET}`);
}

export function loadingAnimation(text = 'Loading', interval = 100) {
  const frames = ['⠙', '⠚', '⠹', '⠼', '⠦', '⠤', '⠆', '⠃', '⠋', '⠉'];
  let i = 0;
  const loadingInterval = setInterval(() => {
    process.stdout.write(`\r${text} ${frames[i++ % frames.length]}`);
  }, interval);

  // Return a function to stop the animation
  return () => {
    clearInterval(loadingInterval);
    process.stdout.write(`\r${' '.repeat(text.length + 2)}\r`); // Clear the line
  };
}

export function displayLotteryAddress(network: string, address: string) {
  const ICON = '🎟️ ';
  showMessage(network, `Lottery contract address → ${address}`, ICON);
}

export function displayERC20TokenAddress(network: string, erc20Token: string, address: string) {
  const ICON = '💵';
  showMessage(network, `${erc20Token} contract address → ${address}`, ICON);
}

export function displayLotteryBalance(network: string, erc20Token: string, balance: string) {
  const ICON = '💰';
  showMessage(network, `Lottery contract balance → ${balance} ${erc20Token}`, ICON);
}

export function displayOwner(network: string, address: string, rate: string) {
  const ICON = '🥷';
  showMessage(network, `Owner → ${address}, Rate → ${rate}`, ICON);
}

export function displayParticipants(network: string, addresses: string[]) {
  const ICON = '🐹';
  for (const address of addresses) {
    showMessage(network, `Participant → ${address}`, ICON);
  }
}

export function displayWinners(network: string, addresses: string[]) {
  const ICON = '🤑';
  for (const address of addresses) {
    showMessage(network, `Winner → ${address}`, ICON);
  }
}

export function displayOwnerRateUpdated(network: string, newRate: number) {
  const ICON = '📈';
  showMessage(network, `Owner rate updated → ${newRate}`, ICON);
}

export function displayTicketPriceUpdated(network: string, newTicketPrice: number) {
  const ICON = '🏷️ ';
  showMessage(network, `Ticket price updated → ${newTicketPrice}`, ICON);
}

export function displayMintedERC20TokensToTestAccounts(network: string, erc20Token: string, value: string) {
  const ICON = '🤖';
  showMessage(network, `Minted ${value} ${erc20Token} to test accounts`, ICON);
}

export function displayERC20TokenBalances(network: string, erc20Token: string, addressesToBalances: Map<string, string>) {
  const ICON = '🤖';

  const entries = Array.from(addressesToBalances.entries());

  entries.forEach(([address, balance]) => {
    showMessage(network, `${erc20Token} balance → ${balance} for ${address}`, ICON);
  });
}

export function displayERC20TokenAdded(network: string, address: string) {
  const ICON = '🀄';
  showMessage(network, `New ERC20 token added → ${address}`, ICON);
}

export function displayERC20TokenSupported(network: string, erc20Token: string, isSupported: boolean) {
  const ICON = '🪙';
  showMessage(network, `ERC20 token → ${erc20Token} is supported → ${isSupported}`, ICON);
}

export function displayLotterySorted(network: string, gasUsed: string) {
  const ICON = '🏁';
  showMessage(network, `Lottery sorted with gas used → ${gasUsed}`, ICON);
}
