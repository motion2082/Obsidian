# Installation

## Install the Plugin

### Via BRAT (Recommended)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin from the Community Plugins browser
2. In Obsidian settings, go to **Community Plugins → BRAT → Add Beta Plugin**
3. Paste this repo URL:
   ```
   https://github.com/UltimateAI-org/aitoolsforobsidian
   ```
4. BRAT will download the latest release and keep it auto-updated
5. Enable **AI Tools** from the plugin list

### Manual Installation

1. Download the latest release files from [GitHub Releases](https://github.com/UltimateAI-org/aitoolsforobsidian/releases):
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. Create the plugin folder: `VaultFolder/.obsidian/plugins/obsidianaitools/`
3. Place the downloaded files in this folder
4. Enable the plugin in **Obsidian Settings → Community Plugins**

## First Launch

On first launch, you'll see an **onboarding wizard** that guides you through:

1. **What is this plugin?** - Learn what AI Tools for Obsidian can do
2. **Prerequisites** - Check if you have Node.js installed
3. **Choose an Agent** - See available AI agents and installation commands
4. **Configure** - Learn how to set up your agent
5. **Ready!** - Get links to documentation and start chatting

After closing the onboarding, the chat view opens automatically!

## Quick Setup

### Node.js Path

**Option 1: Auto-detect (Recommended)**
1. Open **Settings → Agent Client**
2. Click **Auto-detect** next to the Node.js path field
3. If Node.js is installed, the path will be filled automatically

**Option 2: Manual**
```bash [macOS/Linux]
which node
```

```cmd [Windows]
where.exe node
```

### Agent Path

Each agent has an **Auto-detect** button to help find the installation:

1. Open **Settings → Agent Client**
2. Expand the agent section (Claude Code, Codex, Gemini CLI, etc.)
3. Click **Auto-detect** next to the Path field
4. The plugin will search common installation locations

If auto-detect doesn't find your agent, manually enter the path or install it first.
