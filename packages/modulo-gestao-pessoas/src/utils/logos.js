import aliceLogo from '../assets/images/alice.png'
import amilLogo from '../assets/images/amil.png'
import sulamericaLogo from '../assets/images/sulamerica.png'
import bradescoSaudeLogo from '../assets/images/bradesco-saude.png'
import cajuLogo from '../assets/images/caju.png'
import googleWorkspaceLogo from '../assets/images/google-workspace.png'
import claudeLogo from '../assets/images/claude.png'
import figmaLogo from '../assets/images/figma.png'
import slackLogo from '../assets/images/slack.png'
import adobeCreativeCloudLogo from '../assets/images/adobe-creative-cloud.png'
import chatgptLogo from '../assets/images/chatgpt.png'

// Logos de fornecedor e servico que o Figma tem (10334:5539, 10343:14659 e
// 10343:14586), pelo nome. `inset`: quantos px de folga o logo tem dentro do
// badge de 56px - 0 quando ocupa o badge todo (Slack 9, Google Workspace 10.5).
export const LOGOS = {
  Alice: { src: aliceLogo, inset: 0 },
  Amil: { src: amilLogo, inset: 0 },
  SulAmérica: { src: sulamericaLogo, inset: 0 },
  'Bradesco Saúde': { src: bradescoSaudeLogo, inset: 0 },
  Caju: { src: cajuLogo, inset: 0 },
  'Google Workspace': { src: googleWorkspaceLogo, inset: 10.5 },
  Claude: { src: claudeLogo, inset: 0 },
  Figma: { src: figmaLogo, inset: 0 },
  Slack: { src: slackLogo, inset: 9 },
  'Adobe Creative Cloud': { src: adobeCreativeCloudLogo, inset: 0 },
  ChatGPT: { src: chatgptLogo, inset: 0 },
}
