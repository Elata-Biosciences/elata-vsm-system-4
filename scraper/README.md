# Elata Newsbot

A specialized Discord bot that aggregates and summarizes news related to computational neuroscience, precision psychiatry, and other emerging mental health fields for [Elata](https://elata.bio).

You can check out the bot in action on the news channel of our [Discord](https://discord.gg/PJx3TE9r).

## Installation

### 1. Clone the repository:

```bash
git clone https://github.com/yourusername/elata-newsbot.git
cd elata-newsbot
```

### 2. Run the setup script:

For Linux

```bash
./setup_apt.sh
```

For macOS

```bash
./setup_macos.sh
```

### 3. Setup your `.env` file

You can use the `.env.example` file as a template.

### Getting the Required Keys

1. **Discord Bot Token**:

   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the Bot section
   - Create a bot and copy the token

2. **Discord Channel ID**:

   - Enable Developer Mode in Discord (Settings > App Settings > Advanced)
   - Right-click the channel and select "Copy ID"

3. **NewsAPI Key**:

   - Sign up at [NewsAPI](https://newsapi.org/)
   - Get your API key from the dashboard

4. **OpenAI Keys**:
   - Sign up at [OpenAI](https://openai.com/)
   - Get your API key and organization ID from the dashboard

## Running the Bot

```bash
node index.js
```

The `setup_cron.sh` script is used to make sure the the bot runs every day in production.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. You can also
get involved on [Discord](https://discord.gg/PJx3TE9r).

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
