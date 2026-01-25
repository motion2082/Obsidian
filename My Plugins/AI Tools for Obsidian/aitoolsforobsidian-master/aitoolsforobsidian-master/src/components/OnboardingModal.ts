import { Modal, App, ButtonComponent, Setting } from "obsidian";
import type AgentClientPlugin from "../plugin";
import { getAgentInstallCommand } from "../shared/agent-installer";
import { detectWsl, detectNodePath } from "../shared/path-detector";
import { spawn } from "child_process";
import { Platform } from "obsidian";

interface AgentOption {
	id: string;
	name: string;
	provider: string;
	package: string;
	description: string;
}

/**
 * First-run onboarding modal that guides users through initial setup.
 *
 * Simplified flow:
 * 1. Choose an agent
 * 2. Enter API key
 * 3. Base URL (with default)
 * 4. Auto-install and finish
 */
export class OnboardingModal extends Modal {
	private plugin: AgentClientPlugin;
	private currentStep = 0;
	private stepContainer: HTMLElement;

	// Form state
	private selectedAgent: AgentOption | null = null;
	private apiKey = "";
	private baseUrl = "https://chat.ultimateai.org";

	private readonly agents: AgentOption[] = [
		{
			id: "claude-code-acp",
			name: "Claude Code",
			provider: "Anthropic",
			package: "@zed-industries/claude-code-acp",
			description: "Popular for general coding tasks",
		},
		// {
		// 	id: "codex-acp",
		// 	name: "Codex",
		// 	provider: "OpenAI",
		// 	package: "@zed-industries/codex-acp",
		// 	description: "Code generation focused",
		// },
		// {
		// 	id: "gemini-cli",
		// 	name: "Gemini CLI",
		// 	provider: "Google",
		// 	package: "@google/gemini-cli",
		// 	description: "Experimental ACP support",
		// },
	];

	constructor(app: App, plugin: AgentClientPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("obsidianaitools-onboarding-modal");

		// Header
		contentEl.createEl("h2", {
			text: "Welcome to AI Tools for Obsidian",
		});

		contentEl.createEl("p", {
			text: "Chat with AI coding agents directly from your vault",
			cls: "obsidianaitools-onboarding-subtitle",
		});

		// Step container
		this.stepContainer = contentEl.createDiv({
			cls: "obsidianaitools-onboarding-steps",
		});

		// Close button
		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Close")
					.onClick(() => {
						this.close();
					}),
			);

		this.renderCurrentStep();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private nextStep() {
		// Validate current step before proceeding
		if (this.currentStep === 0 && !this.selectedAgent) {
			return;
		}
		if (this.currentStep === 1 && !this.apiKey.trim()) {
			return;
		}

		this.currentStep++;

		if (this.currentStep > 3) {
			// Save settings and finish
			void this.saveSettings().then(() => {
				this.close();
				void this.plugin.activateView();
			});
			return;
		}
		this.renderCurrentStep();
	}

	private async saveSettings(): Promise<void> {
		const settings = this.plugin.settings;

		// Save API key and base URL
		settings.apiKey = this.apiKey.trim();
		settings.baseUrl = this.baseUrl.trim() || "https://chat.ultimateai.org";
		settings.autoInstallAgents = true;

		// Configure selected agent command (after npm install, should be in PATH)
		if (this.selectedAgent) {
			settings.activeAgentId = this.selectedAgent.id;
			if (this.selectedAgent.id === "claude-code-acp") {
				settings.claude.command = "claude-code-acp";
			} else if (this.selectedAgent.id === "codex-acp") {
				settings.codex.command = "codex-acp";
			} else if (this.selectedAgent.id === "gemini-cli") {
				settings.gemini.command = "gemini";
			}
		}

		// Mark onboarding as complete
		settings.hasCompletedOnboarding = true;

		await this.plugin.saveSettings();
	}

	private renderCurrentStep() {
		this.stepContainer.empty();

		switch (this.currentStep) {
			case 0:
				this.renderStep1();
				break;
			case 1:
				this.renderStep2();
				break;
			case 2:
				this.renderStep3();
				break;
			case 3:
				this.renderStep4();
				break;
		}
	}

	private renderStep1() {
		// Choose an agent
		this.stepContainer.createEl("h3", { text: "Choose an agent" });

		this.stepContainer.createEl("p", {
			text: "Select an AI agent to use:",
		});

		// Agent cards
		const cardsContainer = this.stepContainer.createDiv({
			cls: "obsidianaitools-onboarding-cards",
		});

		for (const agent of this.agents) {
			this.createAgentCard(cardsContainer, agent);
		}

		this.addNavigation("Get Started", undefined, true, false, !this.selectedAgent);
	}

	private createAgentCard(parent: HTMLElement, agent: AgentOption) {
		const card = parent.createDiv({
			cls: `obsidianaitools-onboarding-card ${
				this.selectedAgent?.id === agent.id ? "selected" : ""
			}`,
		});
		card.onclick = () => {
			this.selectedAgent = agent;
			this.renderCurrentStep(); // Use renderCurrentStep to properly empty container
		};

		card.createEl("h4", { text: agent.name });
		card.createEl("span", {
			text: agent.provider,
			cls: "obsidianaitools-provider-badge",
		});
		card.createEl("p", { text: agent.description });
	}

	private renderStep2() {
		// Enter API key
		this.stepContainer.createEl("h3", { text: "API key" });

		this.stepContainer.createEl("p", {
			text: `Enter your API key for ${this.selectedAgent?.provider}:`,
		});

		// API key input
		new Setting(this.stepContainer)
			.setName(`${this.selectedAgent?.provider} API key`)
			.setDesc("Your API key is stored securely in Obsidian settings")
			.addText((text) => {
				text.setPlaceholder("Enter your API key")
					.setValue(this.apiKey)
					.onChange((value) => {
						this.apiKey = value;
					});
				text.inputEl.type = "password";
			});

		this.stepContainer.createEl("p", {
			text: "Tip: The API key is used by all agents via ANTHROPIC_AUTH_TOKEN, GEMINI_API_KEY, or OPENAI_API_KEY",
			cls: "obsidianaitools-onboarding-tip",
		});

		this.addNavigation("Next: Base URL ←", "Back", false);
	}

	private renderStep3() {
		// Base URL
		this.stepContainer.createEl("h3", { text: "API endpoint" });

		this.stepContainer.createEl("p", {
			text: "Enter the base URL for API requests:",
		});

		// Base URL input
		new Setting(this.stepContainer)
			.setName("Base URL")
			.setDesc("The API endpoint for all agents")
			.addText((text) => {
				text.setPlaceholder("https://chat.ultimateai.org")
					.setValue(this.baseUrl)
					.onChange((value) => {
						this.baseUrl = value;
					});
			});

		this.stepContainer.createEl("p", {
			text: `Default: ${this.baseUrl}`,
			cls: "obsidianaitools-onboarding-tip",
		});

		this.addNavigation("Install & Connect →", "Back", true, true);
	}

	private renderStep4() {
		// Ready
		this.stepContainer.createEl("h3", { text: "You're All Set!" });

		this.stepContainer.createEl("p", {
			text: `${this.selectedAgent?.name} has been installed and configured.`,
		});

		const statusDiv = this.stepContainer.createDiv({
			cls: "obsidianaitools-onboarding-status",
		});

		statusDiv.createEl("p", { text: `✓ ${this.selectedAgent?.name} installed` });
		statusDiv.createEl("p", { text: "✓ API key configured" });
		statusDiv.createEl("p", { text: "✓ Base URL configured" });

		this.stepContainer.createEl("p", {
			text: "Click 'Start Chatting' to begin:",
			cls: "obsidianaitools-onboarding-tip",
		});

		this.addNavigation("Start chatting!", "Back", true);
	}

	private addNavigation(
		nextText: string,
		backText?: string,
		isPrimary = false,
		triggerInstall = false,
		forceDisabled = false,
	) {
		const navContainer = this.stepContainer.createDiv({
			cls: "obsidianaitools-onboarding-nav",
		});

		if (backText) {
			new ButtonComponent(navContainer)
				.setButtonText(backText)
				.onClick(() => {
					this.currentStep--;
					this.renderCurrentStep();
				});
		}

		const btn = new ButtonComponent(navContainer)
			.setButtonText(nextText)
			.setDisabled(forceDisabled)
			.onClick(async () => {
				if (triggerInstall && this.selectedAgent) {
					// Run installation
					btn.setButtonText("Installing...");
					btn.setDisabled(true);

					const installed = await this.installAgent(
						this.selectedAgent,
					);

					if (installed) {
						// Save settings and proceed
						void this.saveSettings();
						this.currentStep++;
						this.renderCurrentStep();
					} else {
						btn.setButtonText("Installation failed - retry");
						btn.setDisabled(false);
					}
				} else {
					this.nextStep();
				}
			});
		if (isPrimary) {
			btn.setCta();
		}
	}

	private async installAgent(agent: AgentOption): Promise<boolean> {
		const installCommand = getAgentInstallCommand(agent.id);
		if (!installCommand) {
			console.error(`[Onboarding] No install command for agent: ${agent.id}`);
			return false;
		}

		const packageName = installCommand.replace("npm install -g ", "");
		let nodePath = this.plugin.settings.nodePath;

		// Auto-detect WSL if on Windows
		let shouldUseWsl = false;
		let wslDistribution: string | undefined;

		if (Platform.isWin) {
			const wslInfo = detectWsl();
			if (wslInfo.isWsl && wslInfo.distribution) {
				shouldUseWsl = true;
				wslDistribution = wslInfo.distribution;
				console.warn(`[Onboarding] Auto-detected WSL: ${wslDistribution}`);
			}
		}

		// Auto-detect Node.js path if not configured (only for non-WSL)
		if (!shouldUseWsl && !nodePath.trim()) {
			console.warn(`[Onboarding] Node path not set, attempting auto-detect...`);
			const detected = detectNodePath();
			if (detected?.path) {
				nodePath = detected.path;
				console.warn(`[Onboarding] Auto-detected Node.js: ${nodePath}`);
			}
		}

		const nodeDir = !shouldUseWsl && nodePath.trim()
			? nodePath.trim().replace(/\/node$/, "")
			: "";
		const npmExec = nodeDir ? `${nodeDir}/npm` : "npm";

		return new Promise((resolve) => {
			let command: string;
			let args: string[];
			const installArgs = `${npmExec} install -g ${packageName}`;

			if (shouldUseWsl && wslDistribution) {
				// Use WSL
				command = "wsl";
				args = ["--distribution", wslDistribution, "-e", "bash", "-l", "-c", installArgs];
				console.warn(`[Onboarding] Installing ${agent.name} (${packageName}) via WSL...`);
			} else if (Platform.isWin) {
				command = "cmd.exe";
				args = ["/c", installArgs];
				console.warn(`[Onboarding] Installing ${agent.name} (${packageName}) via Windows...`);
			} else {
				command = "/bin/bash";
				args = ["-l", "-c", installArgs];
				console.warn(`[Onboarding] Installing ${agent.name} (${packageName}) via bash...`);
			}

			const child = spawn(command, args, {
				stdio: ["pipe", "pipe", "pipe"],
				env: {
					...process.env,
					...(nodeDir && !shouldUseWsl && !Platform.isWin
						? { PATH: `${nodeDir}:${process.env.PATH || ""}` }
						: {}),
				},
			});

			let output = "";
			let hasTimeout = false;

			// Timeout after 2 minutes
			const timeout = setTimeout(() => {
				hasTimeout = true;
				console.error(`[Onboarding] Installation timed out after 2 minutes`);
				child.kill("SIGTERM");
				resolve(false);
			}, 120000);

			child.stdout?.on("data", (data: unknown) => {
				const text = typeof data === "string" ? data : String(data);
				output += text;
				console.warn(`[Onboarding] npm stdout: ${text.substring(0, 200)}`);
			});
			child.stderr?.on("data", (data: unknown) => {
				const text = typeof data === "string" ? data : String(data);
				output += text;
				console.warn(`[Onboarding] npm stderr: ${text.substring(0, 200)}`);
			});

			child.on("close", (code: number) => {
				clearTimeout(timeout);
				if (hasTimeout) return;

				if (code === 0) {
					console.warn(`[Onboarding] Successfully installed ${agent.name}`);
					resolve(true);
				} else {
					console.error(
						`[Onboarding] Failed to install ${agent.name} (exit code: ${code}): ${output}`,
					);
					resolve(false);
				}
			});

			child.on("error", (error) => {
				clearTimeout(timeout);
				if (hasTimeout) return;
				console.error(`[Onboarding] Error installing ${agent.name}:`, error);
				resolve(false);
			});
		});
	}
}
