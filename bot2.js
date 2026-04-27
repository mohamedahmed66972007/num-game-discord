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
const allowedChannel = '1479024424631009370';

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
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.channel.id !== allowedChannel)
    return interaction.reply({ content: '❌ هذا الأمر يعمل في القناة المحددة فقط', ephemeral: true });

  const name = interaction.commandName;

  if (name === 'معلومات') {

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🎮 معلومات الألعاب مع شرح كامل')
    .setDescription(
`**1️⃣ لعبة الرقم السري (Classic Number Guess)**  
البوت يختار رقمًا سريًا بعدد خانات تحدده، ويجب عليك تخمينه قبل انتهاء الوقت أو نفاد المحاولات.  
- **الأمر:** /لعبة <عدد الخانات> <الدقائق> <عدد المحاولات>  
- **شرح الخيارات:**  
  - الخانات → عدد أرقام الرقم السري (1 إلى 10)  
  - الدقائق → الوقت المسموح لتخمين الرقم  
  - المحاولات → عدد المحاولات المتاحة  
- **مثال:** /لعبة 4 2 10  
  > البوت يختار رقم سري من 4 أرقام، لديك 2 دقيقة و10 محاولات لتخمينه.  
- بعد كل تخمين سيخبرك البوت:  
  - ✅ عدد الأرقام الصحيحة في الرقم  
  - 📌 عدد الأرقام الصحيحة في المكان الصحيح  
  - الوقت المتبقي والمحاولة الحالية والمتبقية  

---

**2️⃣ لعبة البوت يختار الرقم (Guess My Number)**  
البوت يختار رقمًا من 0 إلى 100، ويجب أن تخمن الرقم. البوت يعطيك تلميحات: "أعلى" أو "أقل" أو "صح".  
- **الأمر:** /لعبة_العد  
- **مثال:**  
  1. تكتب /لعبة_العد  
  2. البوت يختار رقم من 0 إلى 100  
  3. تبدأ التخمين بكتابة رقمك في المحادثة  
  4. البوت يرد:  
     - 🔼 أعلى → الرقم أعلى من تخمينك  
     - 🔽 أقل → الرقم أقل من تخمينك  
     - 🎉 صح → لقد فزت

---

**3️⃣ لعبة أنت تختار الرقم والبوت يخمنه (Reverse Guess)**  
أنت تختار رقم من 0 إلى 100، والبوت سيحاول تخمينه باستخدام خوارزمية نصف ونصف (binary search).  
- **الأمر:** /لعبة_العد_العكس  
- **خطوات اللعب:**  
  1. تكتب /لعبة_العد_العكس  
  2. فكر في رقم من 0 إلى 100 في ذهنك  
  3. اكتب **ابدأ** ليبدأ البوت التخمين  
  4. بعد كل تخمين، أخبر البوت:  
     - "أعلى" → الرقم أكبر من تخمينه  
     - "أقل" → الرقم أصغر من تخمينه  
     - "صح" → الرقم صحيح، والبوت يخمن بنجاح  
- **مثال:**  
  - أنت اخترت الرقم 73  
  - البوت يخمن 50 → تكتب "أعلى"  
  - البوت يخمن 75 → تكتب "أقل"  
  - البوت يخمن 73 → تكتب "صح" → انتهت اللعبة  

---

**💡 نصائح عامة:**  
- جميع الأوامر تعمل فقط في القناة المخصصة: <#${allowedChannel}>  
- لا يمكن بدء لعبة جديدة إذا كان لديك لعبة جارية  
- يمكنك متابعة الوقت والمحاولات من الرسائل التي يرسلها البوت بعد كل تخمين  
`
    );

  return interaction.reply({ embeds: [embed] });
}

  if (name === 'لعبة_العد') {
    const gameId = interaction.user.id;
    if (games.has(gameId))
      return interaction.reply({ content: 'لديك لعبة جارية بالفعل!', ephemeral: true });

    const secretNumber = Math.floor(Math.random() * 101);
    games.set(gameId, { type: 'count', secretNumber, attempts: 0 });

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('لعبة البوت يختار الرقم')
      .setDescription('اخترت رقم من 0 إلى 100. ابدأ التخمين.');
    return interaction.reply({ embeds: [embed] });
  }

  if (name === 'لعبة_العد_العكس') {
    const gameId = interaction.user.id;
    if (games.has(gameId))
      return interaction.reply({ content: 'لديك لعبة جارية بالفعل!', ephemeral: true });

    games.set(gameId, { type: 'reverse', min: 0, max: 100, currentGuess: null, attempts: 0 });

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('البوت سيخمن رقمك')
      .setDescription('فكر في رقم من 0 إلى 100 واكتب **ابدأ**');
    return interaction.reply({ embeds: [embed] });
  }

  if (name === 'لعبة') {
    const length = interaction.options.getInteger('الخانات');
    const minutes = interaction.options.getInteger('الدقائق');
    const maxAttempts = interaction.options.getInteger('المحاولات');

    if (length < 1 || length > 10)
      return interaction.reply({ content: '❌ الخانات بين 1 و10', ephemeral: true });

    const secret = generateRandomNumber(length);
    const gameId = interaction.user.id;

    const timeout = setTimeout(() => {
      if (games.has(gameId)) {
        games.delete(gameId);
        interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('انتهى الوقت')
              .setDescription(`الرقم كان **${secret}**`)
          ]
        });
      }
    }, minutes * 60000);

    games.set(gameId, {
      type: 'classic',
      ownerId: interaction.user.id,
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
      .setTitle('🎮 لعبة الرقم السري')
      .setDescription(
        `الخانات: ${length}\n` +
        `الوقت: ${minutes} دقيقة\n` +
        `المحاولات: ${maxAttempts}`
      );
    return interaction.reply({ embeds: [embed] });
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== allowedChannel) return;

  const content = message.content.trim();
  const game = games.get(message.author.id);
  if (!game) return;

  // لعبة البوت يختار الرقم
  if (game.type === 'count') {
    if (!/^\d+$/.test(content)) return;
    const guess = parseInt(content);
    game.attempts++;

    if (guess < game.secretNumber)
      return message.reply('🔼 أعلى');
    if (guess > game.secretNumber)
      return message.reply('🔽 أقل');

    games.delete(message.author.id);
    return message.reply(`🎉 صحيح! الرقم ${game.secretNumber} بعد ${game.attempts} محاولة`);
  }

  // لعبة البوت يخمن رقمك
  if (game.type === 'reverse') {
    if (content.toLowerCase() === 'ابدأ') {
      const guess = Math.floor((game.min + game.max) / 2);
      game.currentGuess = guess;
      game.attempts = 1;
      return message.reply(`هل الرقم **${guess}**؟`);
    }

    if (['أعلى', 'اعلى', 'اعلي'].includes(content.toLowerCase())) {
      game.min = game.currentGuess + 1;
    } else if (['أقل', 'اقل'].includes(content.toLowerCase())) {
      game.max = game.currentGuess - 1;
    } else if (content.toLowerCase() === 'صح') {
      games.delete(message.author.id);
      return message.reply(`🎉 البوت خمن الرقم! هو **${game.currentGuess}** بعد ${game.attempts} محاولة`);
    } else {
      return;
    }

    if (game.min > game.max) {
      games.delete(message.author.id);
      return message.reply('❌ هناك خطأ. اللعبة انتهت.');
    }

    const guess = Math.floor((game.min + game.max) / 2);
    game.currentGuess = guess;
    game.attempts++;
    return message.reply(`هل الرقم **${guess}**؟`);
  }

  // اللعبة الأساسية
  if (game.type === 'classic') {
    if (!/^\d+$/.test(content)) return;
    if (content.length !== game.length)
      return message.reply(`❌ يجب إدخال رقم من ${game.length} خانات`);

    game.attempts++;
    const remainingAttempts = game.maxAttempts - game.attempts;
    const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
    const remainingTime = game.minutes * 60 - elapsed;

    if (content === game.secret) {
      clearTimeout(game.timeout);
      games.delete(message.author.id);
      return message.reply(`🎉 فزت! الرقم الصحيح هو **${game.secret}** بعد ${game.attempts} محاولة`);
    }

    if (remainingAttempts <= 0) {
      clearTimeout(game.timeout);
      games.delete(message.author.id);
      return message.reply(`💀 انتهت المحاولات! الرقم كان **${game.secret}**`);
    }

    const result = checkGuess(game.secret, content);

    const embed = new EmbedBuilder()
      .setColor('#FFFF00')
      .setTitle('نتيجة التخمين')
      .setDescription(
        `**✅ عدد الأرقام الصحيحة:** ${result.correctDigits}\n` +
        `**📌 الأرقام الصحيحة في أماكنها الصحيحة:** ${result.correctPlace}\n\n` +
        `🕒 الوقت المتبقي: \`${remainingTime} ثانية\`\n` +
        `🎯 المحاولة الحالية: \`${game.attempts}\`\n` +
        `🔢 المحاولات المتبقية: \`${remainingAttempts}\``
      );

    return message.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
