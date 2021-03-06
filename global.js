const { Client, RichEmbed } = require('discord.js');
const gl = require('./global.json');
const cmdlist = require('./commands.json');
const fs = require("fs");

const random = require("./functions/random.js");

exports.log = function(msg, ch) {
  if (process.env.debug) {
    console.log(`[log] ${msg}`);
    ch.send(`[LOGGING] ${msg}`)
  }
}

function log(msg, ch) {
  if (process.env.debug == "true") {
    console.log(`[log] ${msg}`);
    ch.send(`[LOGGING] ${msg}`)
  }
}

var guildList = {};
var avatarList = {};
var clientList = {};

exports.ready = function(b, c) {
  if (!b || !c) return false;
  const d = require(`./bots/${b}`);
  if (!gl.disable) {
    var s = d.status;
    var m = d.mode;
    var g = d.game;
    c.user.setPresence({ game: { name: g, type: s }});
    c.user.setStatus(m);
    if (c.guilds.array().length < 1) {
      console.log(`Keystroke ${d.id} Bot Ready | Logged in as ${c.user.username}#${c.user.discriminator} with no servers.`);
    } else if (c.guilds.array().length == 1) {
      console.log(`Keystroke ${d.id} Bot Ready | Logged in as ${c.user.username}#${c.user.discriminator} with ${c.guilds.array().length} server named ${c.guilds.first().name}.`);
    } else {
      console.log(`Keystroke ${d.id} Bot Ready | Logged in as ${c.user.username}#${c.user.discriminator} with ${c.guilds.array().length} servers: ${c.guilds.array()}`);
    };
    c.generateInvite(8).then(invite => {
      c.invite = invite;
    })
    guildList[b.split(".")[0]] = c.guilds.first();
    avatarList[b.split(".")[0]] = c.user.displayAvatarURL;
    clientList[b.split(".")[0]] = c;
    return true;
  } else {
    c.user.setPresence({ game: { name: gl.disablemsg, type: "PLAYING" }});
    c.user.setStatus('dnd');
    console.warn(`[WARNING] Test Mode Active, Bot ${c.user.username} is no longer responding to commands.`)
  }
  exports["notify_" + c.guilds.first().name] = function(title, body, color, footer) {
    var o = c.guilds.first().owner.user;
    if (o) {
      var e = new RichEmbed;
      e.setTitle(title).setColor(color).setFooter(footer).setDescription(body);
      o.send(e);
    } else {
      console.warn("Failed to find a owner for " + b);
    }
  };
};

exports.guildList = guildList;
exports.avatarList = avatarList;
exports.clientList = clientList;

exports.error = function() {
  return gl.maintence;
}

exports.help = async function(b, c, msg) {
  try {
    var ch = msg.channel;
  const d = require(`./bots/${b}.json`);
  if (!b) return false;
  var uptime = c.uptime;
  var e = new RichEmbed().setColor(0x000000)
  if (random.chance(30)) {
   e.setFooter(`X_X I didn't know this was broken and was very difficult to fix`) 
  } else {
    e.setFooter(`Job Request by ${d.owner}`);
  }
  e.setTitle('Help')
    e.setDescription(`Bot ID ${b} | Ping ${c.ping} | Bot Uptime ${uptime} | For assistance please contact WyattL#3477`);
    if (true) {
      var cmd_dir = "./commands/"
      await fs.readdir(cmd_dir, function(err, files) {
          if (err) throw err;
          if (files) {
            var commands = files;
            var i;
            for (i = 0; i < commands.length; i++) {
                var cmd = commands[i];
                var command = require("./commands/" + cmd.split(".js")[0]);
                if (d.commands.includes(cmd.split(".js")[0]) || d.special == 'true' || d.special == true) {
                  log('cmd ' + cmd + ' allowed/special', ch);
                  if (!command.hide) {
                    var desc = command.description;
                    var usage = command.usage;
                    var permission = command.permission
                    if (!usage) {
                      usage = cmd;
                    }
                    if (!desc) {
                      desc = "This should be set, but for some reason, isn't."
                    }
                    if (desc && usage) {
                      log('desc: ' + desc + ' : ' + 'usage: ' + usage, ch);
                      desc = desc.replace(/OWNER/g, c.guilds.first().owner.displayName);
                      usage = usage.replace(/OWNER/g, c.guilds.first().owner.displayName);
                      desc = desc.replace(/CHANNEL/g, msg.channel.name);
                      usage = usage.replace(/CHANNEL/g, msg.channel.name);
                    }
                    e.addField(`${d.prefix}${usage}`, `${desc}`, false);
                  }
                }
              };
            msg.channel.send(e);
          } else {
            throw "global.js stack trace : during help : no command files found";
          }
        });
    } else {
        var cmd_dir = `./commands/`;
        fs.readdir(cmd_dir, function (err, files) {
            if (err) throw err;
            if (!files) {
                console.error('Invalid cmd directory. No files contained within directory.')
            } else {
                var i;
                for (i = 0; i < files.length; i++) {
                    e.addField(`${files[i].split('.')[0]}`, `${cmdlist[i]}`, false);
                };
            };
        });
    }
  } catch(err) {
    throw `stack trace error @ global.js whilst executing help function with data ${err}`
  }
}

exports.helpcmd = function(n, c, msg, cmd) {
  try {
    var command = require("./commands/" + cmd + ".js");
    var d = require(`./bots/${n}.json`);
    var desc = command.description;
    var usage = command.usage;
    var permission = command.permission;
    if (!permission) permission = "Everyone can use it!"
    if (desc && usage) {
      desc = desc.replace(/OWNER/g, c.guilds.first().owner.displayName);
      usage = usage.replace(/OWNER/g, c.guilds.first().owner.displayName);
      desc = desc.replace(/CHANNEL/g, msg.channel.name);
      usage = usage.replace(/CHANNEL/g, msg.channel.name);
    }
    var embed = new RichEmbed;
    embed.addField("Description", desc, true);
    embed.addField("Usage", d.prefix + usage, true);
    embed.addField("Permission", d.permission, true);
    embed.setColor(0x000000);
    var cmdUpper = `${cmd.slice(0, 1).toUpperCase()}${cmd.slice(1, cmd.length)}`;
    embed.setTitle(cmdUpper);
    embed.setFooter("WyattL#3477");
    msg.channel.send(embed);
  } catch(err) {
    msg.channel.send(`stack trace error @ global:helpcmd with data ${msg.content}/${cmd} due to ${err}`)
  }
};