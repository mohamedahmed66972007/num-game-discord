require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const games = new Map();

function generateRandomNumber(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function checkGuess(secret, guess) {
  const secretDigits = secret.split('');
  const guessDigits = guess.split('');

  let correctDigits = 0;
  let correctPlace = 0;

  const used = new Array(secretDigits.length).fill(false);

  for (let i = 0; i < guessDigits.length; i++) {
    if (guessDigits[i] === secretDigits[i]) {
      correctPlace++;
      correctDigits++;
      used[i] = true;
    }
  }

  for (let i = 0; i < guessDigits.length; i++) {
    if (guessDigits[i] !== secretDigits[i]) {
      for (let j = 0; j < secretDigits.length; j++) {
        if (!used[j] && guessDigits[i] === secretDigits[j]) {
          correctDigits++;
          used[j] = true;
          break;
        }
      }
    }
  }

  return { correctDigits, correctPlace };
}

client.on('ready', () => {
  console.log(`تم تسجيل الدخول باسم ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (content.startsWith('!لعبة')) {

    const args = content.split(' ');

    if (args.length < 4) {
      return message.reply('مثال:\n`!لعبة 4 1 10`\n4 = عدد الأرقام\n1 = الدقائق\n10 = المحاولات');
    }

    const length = parseInt(args[1]);
    const minutes = parseInt(args[2]);
    const maxAttempts = parseInt(args[3]);

    if (isNaN(length) || length < 1 || length > 10) {
      return message.reply('عدد الأرقام يجب أن يكون بين 1 و 10');
    }

    if (isNaN(minutes) || minutes < 1 || minutes > 60) {
      return message.reply('الدقائق بين 1 و 60');
    }

    if (isNaN(maxAttempts) || maxAttempts < 1 || maxAttempts > 100) {
      return message.reply('المحاولات بين 1 و 100');
    }

    const secret = generateRandomNumber(length);

    const timeout = setTimeout(() => {
      if (games.has(message.author.id)) {
        games.delete(message.author.id);

        message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('انتهى الوقت')
              .setDescription(`لقد خسرت\nالرقم السري كان: **${secret}**`)
          ]
        });
      }
    }, minutes * 60000);

    games.set(message.author.id, {
      secret,
      length,
      attempts: 0,
      maxAttempts,
      startTime: Date.now(),
      minutes,
      timeout
    });

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('لعبة تخمين الأرقام')
      .setDescription(
        `**عدد الخانات:** ${length}\n` +
        `**الوقت:** ${minutes} دقيقة\n` +
        `**المحاولات:** ${maxAttempts}`
      );

    await message.reply({ embeds: [embed] });
  }

  else if (/^\d+$/.test(content) && games.has(message.author.id)) {

    const game = games.get(message.author.id);
    const guess = content;

    if (guess.length !== game.length) {
      return message.reply(`يجب إدخال رقم من ${game.length} خانات`);
    }

    game.attempts++;

    const remainingAttempts = game.maxAttempts - game.attempts;

    const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
    const remainingTime = game.minutes * 60 - elapsed;

    if (guess === game.secret) {
      clearTimeout(game.timeout);
      games.delete(message.author.id);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎉 فوز!')
            .setDescription(`تم تخمين الرقم الصحيح **${game.secret}** بعد ${game.attempts} محاولة`)
        ]
      });
    }

    if (remainingAttempts <= 0) {
      clearTimeout(game.timeout);
      games.delete(message.author.id);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('💀 خسارة!')
            .setDescription(`انتهت المحاولات\nالرقم السري كان: **${game.secret}**`)
        ]
      });
    }

    const result = checkGuess(game.secret, guess);

const embed = new EmbedBuilder()
  .setColor('#FFFF00')
  .setTitle('نتيجة التخمين')
  .setDescription(
    `**✅ عدد الأرقام الصحيحة:** ${result.correctDigits}\n` +
    `**📌 الأرقام الصحيحة في أماكنها الصحيحة:** ${result.correctPlace}\n\n` + // سطر فارغ هنا
    `🕒 الوقت المتبقي: \`${remainingTime} ثانية\`\n` +
    `🎯 المحاولة الحالية: \`${game.attempts}\`\n` +
    `🔢 المحاولات المتبقية: \`${remainingAttempts}\`\n\n` +
    `_استمر في المحاولة حتى تخمن الرقم الصحيح!_`
  );

    message.reply({ embeds: [embed] });
  }
}); 

client.login(process.env.DISCORD_TOKEN);