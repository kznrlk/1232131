const Discord = require("discord.js");
const sourcebin = require('sourcebin');
const config = require("./config.json");
const fs = require('fs');
const { QuickDB } = require("quick.db");
const { JsonDatabase } = require("wio.db");

// Database
global.db = new QuickDB();
global.dbJson = new JsonDatabase({
    databasePath: "./databases/myJsonDatabase.json"
});
//--

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessageReactions,
        '32767'
    ]
});

module.exports = client

client.on('interactionCreate', (interaction) => {

    if (interaction.type === Discord.InteractionType.ApplicationCommand) {

        const cmd = client.slashCommands.get(interaction.commandName);

        if (!cmd) return interaction.reply({ content: `Erro, este comando não existe`, ephemeral: true });

        interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);

        cmd.run(client, interaction)

    }
});

client.on("ready", () => {
    client.user.setUsername(config.client.username).catch((error) => {
        console.log('❌ Não foi possível alterar o nome do bot neste momento.')
    });
    client.user.setAvatar(config.client.avatar).catch((error) => { });

    console.log(`👋 Olá Mundo`)
    console.log(`🤖 Meu nome é ${client.user.username}`)
    console.log(`💔 Eu tenho ${client.users.cache.size} amigos`)
    console.log(`👨 Mais do que ${client.guilds.cache.size} grupos me apoiam.`)
});

/*============================= | Anti OFF | =========================================*/

process.on('multipleResolves', (type, reason, promise) => {
     return;
 });
 process.on('unhandRejection', (reason, promise) => {
     return;
 });
process.on('uncaughtException', (error, origin) => {
     return;
 });
 process.on('uncaughtException', (error, origin) => {
     return;
 });


/*============================= | STATUS RICH PRESENCE | =========================================*/

client.on("ready", () => {
    let react = [
        `🤖 Duvidas?`,
        `🤖 ajuda`,
        `🎫 ticket`,
        `🥳 discord.gg/REhF3UQuJh`,
        `🏡 Store Prada Store`,
        `🌐 Version: v${require('discord.js').version.slice(0, 6)}`
    ],
        fera = 0;
    setInterval(() => client.user.setPresence({
        activities: [{
            name: `${react[fera++ % react.length]}`,
            type: Discord.ActivityType.Streaming,
            url: 'www.youtube.com/@pxtrem442/videos/'
        }]
    }), 1000 * 10);

    client.user
        .setStatus("online");
});


/*============================= | Import handler | =========================================*/

client.slashCommands = new Discord.Collection()

require('./handler')(client)

client.login(config.client.token)

client.on('interactionCreate', require('./events/createProduct').execute)
client.on('interactionCreate', require('./events/showProduct').execute)
client.on('interactionCreate', require('./events/startCheckout').execute)
client.on('interactionCreate', require('./events/addStockProducts').execute)
client.on('interactionCreate', require('./events/editProduct').execute)

/*============================= | UPDATE PRODUCT | =========================================*/
setInterval(async () => {
    var row = await db.all();
    row = row.filter(p => p.id.startsWith('product_'));

    row.forEach(async product => {
        if (!product.value.channel) return;

        const channel = await client.channels.cache.get(product.value.channel.channelId)
        const message = await channel.messages.fetch(product.value.channel.messageId).catch(() => { })

        try {
            message.edit({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(config.client.embed)
                        .setTitle(channel.guild.name)
                        .setThumbnail(channel.guild.iconURL({ dynamic: true, format: "png", size: 4096 }))
                        .setDescription(`\`\`\`yaml\n${product.value.body}\`\`\` \n**✉️・Nome:** \`${product.value.name}\`\n**💳・Preço:** \`R$${product.value.value.toFixed(2)}\`\n**🛒・Estoque:** \`${product.value.stocks ? product.value.stocks.length : 0}\``)
                        .setFooter({ text: `Para comprar clique no botão comprar` })
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`sales-${product.value.id}`)
                                .setStyle(3)
                                .setEmoji('<:emojimais1:1064050366750150686>')
                                .setLabel('Comprar')
                        )
                ]
            })
        } catch (error) {

        }
    });
}, 60000);

// SISTEMA DE TICKETS

client.on("interactionCreate", (interaction) => {
    if (interaction.isSelectMenu()) {
      if (interaction.customId === "painel_ticket") {
        let opc = interaction.values[0]
        if (opc === "opc1") {
  
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          // Nova opção
  
          let nome = `🛠️・Suporte`;
          let categoria = "1061771538862444667" // Coloque o ID da categoria
  
          if (!interaction.guild.channels.cache.get(categoria)) categoria = null;
  
          if (interaction.guild.channels.cache.find(c => c.name === nome)) {
            interaction.reply({ content: `❌ Você já possui um ticket aberto em ${interaction.guild.channels.cache.find(c => c.name === nome)}!`, ephemeral: true })
          } else {
            interaction.guild.channels.create({
            name: nome,
            type: Discord.ChannelType.GuildText,
            parent: categoria,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [
                  Discord.PermissionFlagsBits.ViewChannel
                ]
              },
              {
                id: interaction.user.id,
                allow: [
                  Discord.PermissionFlagsBits.ViewChannel,
                  Discord.PermissionFlagsBits.SendMessages,
                  Discord.PermissionFlagsBits.AttachFiles,
                  Discord.PermissionFlagsBits.EmbedLinks,
                  Discord.PermissionFlagsBits.AddReactions
                ]
              }
            ]
          }).then( (ch) => {
            interaction.reply({ content: `✅ Olá ${interaction.user}, seu ticket foi aberto em ${ch}!`, ephemeral: true })
            let embed = new Discord.EmbedBuilder()
            .setColor("Random")
            .setDescription(`Olá ${interaction.user}, Você abriu o ticket de Suporte, para nos ajudar ja me fale qual é o problema.`);
            let botao = new Discord.ActionRowBuilder().addComponents(
              new Discord.ButtonBuilder()
            .setCustomId("fechar_ticket")
            .setEmoji("🔒")
            .setStyle(Discord.ButtonStyle.Danger)
            );
  
            ch.send({ embeds: [embed], components: [botao] }).then( m => { 
              m.pin()
             })
          })
          }
          
        } else if (opc === "opc2") {
  
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          // Nova opção
  
          let nome = `❓・Duvida`;
          let categoria = "1061771538862444667" // Coloque o ID da categoria
  
          if (!interaction.guild.channels.cache.get(categoria)) categoria = null;
  
          if (interaction.guild.channels.cache.find(c => c.name === nome)) {
            interaction.reply({ content: `❌ Você já possui um ticket aberto em ${interaction.guild.channels.cache.find(c => c.name === nome)}!`, ephemeral: true })
          } else {
            interaction.guild.channels.create({
            name: nome,
            type: Discord.ChannelType.GuildText,
            parent: categoria,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [
                  Discord.PermissionFlagsBits.ViewChannel
                ]
              },
              {
                id: interaction.user.id,
                allow: [
                  Discord.PermissionFlagsBits.ViewChannel,
                  Discord.PermissionFlagsBits.SendMessages,
                  Discord.PermissionFlagsBits.AttachFiles,
                  Discord.PermissionFlagsBits.EmbedLinks,
                  Discord.PermissionFlagsBits.AddReactions
                ]
              }
            ]
          }).then( (ch) => {
            interaction.reply({ content: `✅ Olá ${interaction.user}, seu ticket foi aberto em ${ch}!`, ephemeral: true })
            let embed = new Discord.EmbedBuilder()
            .setColor("Random")
            .setDescription(`Olá ${interaction.user}, Você abriu o ticket de Duvida, para nos ajudar ja me fale qual é sua Duvida.`);
            let botao = new Discord.ActionRowBuilder().addComponents(
              new Discord.ButtonBuilder()
            .setCustomId("fechar_ticket")
            .setEmoji("🔒")
            .setStyle(Discord.ButtonStyle.Danger)
            );
  
            ch.send({ embeds: [embed], components: [botao] }).then( m => { 
              m.pin()
             })
          })
          }
          
        } else if (opc === "opc3") {

                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          // Nova opção
  
          let nome = `🤝・Parceria`;
          let categoria = "1061771538862444667" // Coloque o ID da categoria
  
          if (!interaction.guild.channels.cache.get(categoria)) categoria = null;
  
          if (interaction.guild.channels.cache.find(c => c.name === nome)) {
            interaction.reply({ content: `❌ Você já possui um ticket aberto em ${interaction.guild.channels.cache.find(c => c.name === nome)}!`, ephemeral: true })
          } else {
            interaction.guild.channels.create({
            name: nome,
            type: Discord.ChannelType.GuildText,
            parent: categoria,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [
                  Discord.PermissionFlagsBits.ViewChannel
                ]
              },
              {
                id: interaction.user.id,
                allow: [
                  Discord.PermissionFlagsBits.ViewChannel,
                  Discord.PermissionFlagsBits.SendMessages,
                  Discord.PermissionFlagsBits.AttachFiles,
                  Discord.PermissionFlagsBits.EmbedLinks,
                  Discord.PermissionFlagsBits.AddReactions
                ]
              }
            ]
          }).then( (ch) => {
            interaction.reply({ content: `✅ Olá ${interaction.user}, seu ticket foi aberto em ${ch}!`, ephemeral: true })
            let embed = new Discord.EmbedBuilder()
            .setColor("Random")
            .setDescription(`Olá ${interaction.user}, Você abriu o ticket de Suporte, para nos ajudar ja me fale qual é o problema.`);
            let botao = new Discord.ActionRowBuilder().addComponents(
              new Discord.ButtonBuilder()
            .setCustomId("fechar_ticket")
            .setEmoji("🔒")
            .setStyle(Discord.ButtonStyle.Danger)
            );
  
            ch.send({ embeds: [embed], components: [botao] }).then( m => { 
              m.pin()
             })
          })
          }
          
        } else if (opc === "opc4") {
  
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          // Nova opção
  
          let nome =`💵・Resgatar`;
          let categoria = "1061771538862444667" // Coloque o ID da categoria
  
          if (!interaction.guild.channels.cache.get(categoria)) categoria = null;
  
          if (interaction.guild.channels.cache.find(c => c.name === nome)) {
            interaction.reply({ content: `❌ Você já possui um ticket aberto em ${interaction.guild.channels.cache.find(c => c.name === nome)}!`, ephemeral: true })
          } else {
            interaction.guild.channels.create({
            name: nome,
            type: Discord.ChannelType.GuildText,
            parent: categoria,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [
                  Discord.PermissionFlagsBits.ViewChannel
                ]
              },
              {
                id: interaction.user.id,
                allow: [
                  Discord.PermissionFlagsBits.ViewChannel,
                  Discord.PermissionFlagsBits.SendMessages,
                  Discord.PermissionFlagsBits.AttachFiles,
                  Discord.PermissionFlagsBits.EmbedLinks,
                  Discord.PermissionFlagsBits.AddReactions
                ]
              }
            ]
          }).then( (ch) => {
            interaction.reply({ content: `✅ Olá ${interaction.user}, seu ticket foi aberto em ${ch}!`, ephemeral: true })
            let embed = new Discord.EmbedBuilder()
            .setColor("Random")
            .setDescription(`Olá ${interaction.user}, Você abriu o ticket de Problemas no Produto, para nos ajudar ja me fale qual é o Problema do Produto.`);
            let botao = new Discord.ActionRowBuilder().addComponents(
              new Discord.ButtonBuilder()
            .setCustomId("fechar_ticket")
            .setEmoji("🔒")
            .setStyle(Discord.ButtonStyle.Danger)
            );
  
            ch.send({ embeds: [embed], components: [botao] }).then( m => { 
              m.pin()
             })
          })
          }
          
        }
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === "fechar_ticket") {
        interaction.reply(`Olá ${interaction.user}, este ticket será excluído em 5 segundos...`)
        setTimeout ( () => {
          try { 
            interaction.channel.delete()
          } catch (e) {
            return;
          }
        }, 5000)
      }
    }
  })

// SISTEMA DE SUGESTÂO

client.on('interactionCreate', async interaction => {

  if (interaction.isButton()) {
    if (interaction.customId.startsWith("botao_modal")) {
      const modal = new Discord.ModalBuilder()
        .setCustomId('modal_sugestao')
        .setTitle(`Olá usuário, Nos diga qual é a sua sugestão.`)
      const sugestao3 = new Discord.TextInputBuilder()
        .setCustomId('sugestão')
        .setLabel('Qual sua sugestão?')
        .setStyle(Discord.TextInputStyle.Paragraph)

      const firstActionRow = new Discord.ActionRowBuilder().addComponents(sugestao3);
      modal.addComponents(firstActionRow)
      await interaction.showModal(modal);

      interaction.followUp({
        content: `${interaction.user}, Não abuse dessa função, caso contrario poderá e irá resultar em banimento.`,
        ephemeral: true
      })

    }
  }
  //

  if (!interaction.isModalSubmit()) return;
  if (interaction.customId === 'modal_sugestao') {
    const moment = require("moment")
    let channel = client.channels.cache.get('1012975805162336276') //canal para o envio da sugestão.
    const sugestao2 = interaction.fields.getTextInputValue('sugestão');

    interaction.reply({
      content: `<a:aceito:1040802508546777168> | ${interaction.user}, Sua sugestão foi enviada com sucesso!`, ephemeral: true
    })

    channel.send({
      embeds: [new Discord.EmbedBuilder()
        .setColor('Random')
        .setAuthor({ name: `👤 - ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dinamyc: true }) })
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dinamyc: true }) })
        .setThumbnail(interaction.user.displayAvatarURL({ format: "png", dinamyc: true, size: 4096 }))
        .setDescription(`**Horário da sugestão:**
<t:${moment(interaction.createdTimestamp).unix()}>(<t:${parseInt(interaction.createdTimestamp / 1000)}:R>)

**Sobre o usuário:**

**ID:** (\`${interaction.user.id}\`)
**Usuario que fez a sugestão:** ${interaction.user}
**Nome no discord:** \`${interaction.user.tag}\`

**Sugestão:**
\`\`\`${sugestao2}\`\`\``)
      ]
    })
  }
})

