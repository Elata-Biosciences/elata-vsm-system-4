# Elata VSM System

View the live system at [news.elata.bio](https://news.elata.bio)

<p align="center">
  <a href="https://discord.gg/4CZ7RCwEvb"><img src="https://img.shields.io/discord/1234567890?color=7289da&label=Discord&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://github.com/elata/vsm-system-4/blob/main/LICENSE"><img src="https://img.shields.io/github/license/elata/vsm-system-4" alt="License"></a>
  <a href="https://github.com/elata/vsm-system-4/stargazers"><img src="https://img.shields.io/github/stars/elata/vsm-system-4" alt="Stars"></a>
</p>

## About Elata

Elata Biosciences is pioneering an open-source model at the intersection of blockchain and neuropsychiatry.

Our mission is to create a decentralized, distributed, and open ecosystem that utilizes blockchain to capitalize drug development efforts in high-impact areas across psychiatry.

We aim to pursue opportunities in areas of high unmet patient need and assemble a collective of experts around the given area to create new solutions.

To achieve our goals, we consider the entire drug development pipeline from start to finish by utilizing novel or undervalued basic and applied science and translating these findings into real-world solutions for patients. Our iterative approach combines the power of working directly with patient communities and alternative governance structures that can finance these innovations.

Elata Biosciences is functioning as a Decentralized Autonomous Organization (DAO) and does not have a CEO or Board of Directors. Its members govern the organization through voting on governance proposals with our governance token. The token utilized for governance within Elata is the ERC-20 token, $ELATA. A person or organization verifiably holding at least one governance token becomes a member automatically.

Elata Biosciences employs a democratic governance model where each token holder's voting power is directly proportional to their token holdings. Specifically, each $ELATA token represents one vote, ensuring that governance is distributed among all token holders based on their stake in the DAO. This one token, one vote system is guided by insights from our stewards and core teams, facilitating a community-driven approach where every token holder's voice is heard, proportional to their commitment to the DAO.

You can learn more about us on our website [here](https://elata.bio), join our [Discord](https://discord.gg/4CZ7RCwEvb) to stay updated on our progress, or read the news provided by this system at [news.elata.bio](https://news.elata.bio).

## Inspiration for this Project (What is Viable System Model System 4?)

The Elata VSM (Viable System Model) System implements System 4 of Stafford Beer's cybernetic framework for organizational management, specifically adapted for Decentralized Autonomous Organizations (DAOs). In Beer's model, System 4 serves as the "outside and future" sensing organ - monitoring the environment and planning for adaptation. [This project applies this principle to the DAO's decision-making process.](https://kelsienabben.substack.com/p/aligning-the-concept-of-decentralized)

Our platform acts as the DAO's environmental scanner, using AI to process information about scientific papers, industry developments, consumer trends, developments in decentralized science, and research breakthroughs. This systematic monitoring allows the DAO to detect emerging opportunities, potential threats, and shifting paradigms that could impact its strategic direction. By transforming this environmental data into actionable intelligence, the system enables informed decision-making by token holders and helps maintain the organization's viability in a complex, fast-moving landscape.

The overall intent of this project is to [automate as much of the DAO's System 4 process as possible with AI.](https://kelsienabben.substack.com/p/governatooorr-guardrails-practical)

## System Overview

```
elata-vsm-system/
├── scraper/         # AI-powered news aggregation engine
├── web/             # Next.js frontend platform
└── shared-types/    # Shared TypeScript types
```

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/Elata-Biosciences/elata-vsm-system-4.git
cd elata-vsm-system-4
```

2. Follow setup guides for each module
   For detailed setup instructions:

- [Scraper Setup Guide](scraper/README.md)
- [Web Platform Guide](web/README.md)
- [Shared Domain Logic](shared-types/README.md)

## Technical Overview

### Scraper Engine

- Node.js, Express,TypeScript
- PM2 process management
- OpenAI API for content analysis against our scrapping sources
- NewsAPI for keyword-based news aggregation
- Automated data aggregation
- [Full Scraper Documentation](scraper/README.md)

### Web Platform

- Next.js 15 with App Router
- Server-side rendering
- [Full Web Documentation](web/README.md)

### Shared Domain Logic

- TypeScript
- Zod schemas for data validation and ChatGPT structured outputs
- [Full Shared Domain Logic Documentation](shared-types/README.md)

## Contributing

We welcome contributions! You can join our [Discord](https://discord.gg/4CZ7RCwEvb) to discuss ideas, ask questions, and contribute to the project.

All skill levels are welcome to contribute, and let us know if you need help getting started.

## Roadmap

- [ ] Integration of more advanced AI models for analysis pending token launch
- [ ] Integration with communities on Reddit, X, Farcaster, and Discord
- [ ] Addition of more sources and keywords for scraping
- [ ] Scrapping for more complex scientific and grey literature sources
- [ ] Assistance in flagging information about new molecules, drugs, research, and devices for deal flow

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

<p align="center">
  <a href="https://elata.bio">Elata Biosciences</a> •
  <a href="https://twitter.com/Elata_Bio">Twitter</a> •
  <a href="https://discord.gg/4CZ7RCwEvb">Discord</a>
</p>
