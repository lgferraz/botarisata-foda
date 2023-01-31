const tmi = require('tmi.js');
const fs = require('fs');
const { deflate } = require('zlib');

const client = new tmi.Client({
	options: { debug: true },
	connection: {
		secure: true,
		reconnect: true
	},
	identity: {
		username: '',
		password: ''
	},
	channels: [ '' ]
});

client.connect();

function ajuda(canal, usuario){

    client.say(canal, "Use <!artista [user/id do artista] [plataforma em que ele publica]> para adicionar um artista dentro da lista de recomendações, ou use <!recomendar> para receber uma recomendação de dentro da lista. Caso tenha errado e queira remover um artista, basta usar <!remover [user/id do artista que deseja remover]>. OBS: coloque o id/user, só use o nome, se for nome único. O bot usa os espaços em branco para reconhecer os argumentos. @"+usuario);

}

function repetido(artista){
    data = fs.readFileSync('artistas.txt', 'utf-8', function (err, data) {});
    data = data.split('\n');
    tamanho = data.length - 2;
    for (i=0;i<=tamanho;i++){
        nomeArtista = data[i].split('|')[0];
        if (nomeArtista === artista){
            return true;
        }
    }
    return false;

}

function removerArtista(client, canal, usuario, artista){
    data = fs.readFileSync('artistas.txt', 'utf-8', function (err, data) {});
    fs.writeFile('artistas(backup).txt', data, {enconding:'utf-8',flag: 'w'}, function (err, data){});
    data = data.split('\n');
    tamanho = data.length - 2;
    for (i=0;i<=tamanho;i++){
        nomeArtista = data[i].split('|')[0];
        usuarioRecomendou = data[i].split('|')[2];
        if (nomeArtista === artista && usuario === usuarioRecomendou){
            remover = data.splice(i, 1)
            data = data.join('\n');
            console.log(data);
            fs.writeFile('artistas.txt', data, {enconding:'utf-8',flag: 'w'}, function (err, data){
                if (err) {
                    client.say(canal, "Erro ao remover artista.");
                    console.log(err);
                } else{
                    client.say(canal, "Artista removido com sucesso @"+ usuario);
                }
            });
            return 0;
        }
    }
    client.say(canal, "Artista não encontrado. @"+usuario);

}


function adicionarArtista(client, canal, usuario, artista, plataforma){
    recomendacao = artista+'|'+plataforma+'|'+usuario+'\n';
    if (repetido(artista)){
        client.say(canal, "O artista "+artista+" já foi adicionado por outra pessoa");
        return 0;
    }
    else{
        fs.writeFile('artistas.txt', recomendacao, {enconding:'utf-8',flag: 'a'}, function (err, data){
            if (err) {
                client.say(canal, "Erro ao adicionar artista.");
                console.log(err);
            } else{
                client.say(canal, "Artista adicionado com sucesso @"+ usuario);
            }
        });
        return 0;
    }
}

function recomendarArtista(client, canal, usuario){
    artistas = fs.readFile('artistas.txt', 'utf-8', function (err, data) {
        if (err) {
            client.say(canal, "Erro ao recomendar artista. @"+usuario);
            console.log(err);
        } else{
            data = data.split('\n');
            tamanho = data.length - 2;
            aleatorio = Math.floor(Math.random() * tamanho + 1);
            data = data[aleatorio].split('|');
            artista = data[0]
            plataforma = data[1]
            usuarioRecomendou = data[2]

            client.say(canal, "O artista "+ artista +", que pode ser encontrado na plataforma "+plataforma+", foi recomendado por @"+ usuarioRecomendou);
        }
    });
    

}


client.on('message', (channel, tags, message, self) => {
	if(self || !message.startsWith('!')) return;

    usuario = tags.username;
    split = message.split(" ");
    comando = split[0];

    if (split.length > 3 || split.length <= 2 && comando != "!remover" || comando === "!ajuda"){
        ajuda(channel, usuario);
    } else{
        if (comando === "!remover"){
            artista = split[1];
            removerArtista(client, channel, usuario, artista);
        }

        if (comando === "!artista"){
            artista = split[1];
            plataforma = split[2];
            adicionarArtista(client, channel, usuario, artista, plataforma);
        }

        if (comando === "!recomendar"){
            recomendarArtista(client, channel, usuario);
        }
    }
});