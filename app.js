
var RequestConfig=require('./RequestConfig');
var restify = require('restify');
var builder = require('botbuilder');
var querystring=require('querystring');
var request=require('request');
var rp= require('request-promise');
var striptags=require('striptags');
var template= require('./deliveryAdaptive');
var validator = require("email-validator");
var sender=require('./deliveryEmail');
var datos,menu;
var i,cont;
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3000, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector,[
    (session, args, next) => {
        session.beginDialog('welcome');
    },
    (session, results, next) => {

        if (results.response===0) {
         session.beginDialog('pedido');
        } 
        else if (results.response===1)
        {
            session.beginDialog('consulta');
        }
    },
    (session, results, next) => {

        if (results.response.toString()==='false')
        {
           session.beginDialog('observaciones');
        }
        else 
        {
            session.beginDialog('busqueda');
        }
    },
    (session, results, next) => {

        if (results.response.toString()==='false')
        {
           session.beginDialog('observaciones');
        }
        else 
        {
            next();
        }
    },
    (session, results, next) => {

        session.beginDialog('mostrarpedido');
    },
    (session, results, next) => {
        if(results.response)
        {
            if(results.response.toString()==='agregar')
            {
            session.beginDialog('busqueda');
            }
        }    
        else
        {
            next();
        }
    },
    (session, results, next) => {
        if(results.response)
        {
            if (results.response.toString()==='false')
            {
           session.beginDialog('observaciones');
            }
         }
        else 
        {
            next();
        }
    },(session,results,next)=>{
        if(results.response)
        {
            if (results.response.toString()==='resumen')
         {
            session.beginDialog('mostrarpedido');
         }
        }
        else
        {
             next();
        }

    },(session,results,next)=>{
        session.endDialog();
    }]);


bot.dialog('welcome',[function(session){
    builder.Prompts.choice(session,'Hola, en que puedo ayudarte?','Quiero hacer un pedido|Quiero hacer una pregunta',{listStyle: builder.ListStyle.button})
},function(session,results){
    session.endDialogWithResult({response:results.response.index})
}]);



bot.dialog('pedido',[(session)=>{
    datos={};
    datos.obs="Ninguna";
    datos.pedido=[];
    cont=0;
     rp(RequestConfig.GetRequest('/menu')).then((body)=>{
                    menu=JSON.parse(body);
                    console.log('Menu fetched...');
                 builder.Prompts.text(session,'Esta bien, ¿Cuál es tu nombre?');
                });
                

},(session,results)=>{
   datos.nomcli=results.response;
   builder.Prompts.text(session,'Bien '+datos.nomcli+', escribe tu dirección')
},(session,results)=>{
    datos.direccion=results.response;
    session.beginDialog('emailprompt');
 },(session,results)=>{
     var attachs=[];
         for (var i=0;i<menu.nombre.length;i++)
         {
          attachs.push(new builder.HeroCard(session)
                       .title(menu.nombre[i])
                       .images([
                           builder.CardImage.create(session,menu.images[i])
                       ])
                       .buttons([
                            builder.CardAction.imBack(session, menu.nombre[i], "Ver") 
                       ]));
                             
         };
         attachs.push(new builder.HeroCard(session)
         .title('Buscar otros platos de la Carta')
         .images([
            builder.CardImage.create(session,'https://image.ibb.co/b2CU2H/search_123.png')
        ])            
        .buttons([
            builder.CardAction.postBack(session, 'Otros platos', "Buscar") 
         ]));
                             
         var msg= new builder.Message(session)
                  .attachmentLayout(builder.AttachmentLayout.carousel)
                  .attachments(attachs);
                  session.send('Bien, aquí te mostraré algunas sugerencias con nuestros platos más pedidos:');
    builder.Prompts.choice(session, msg,menu.nombre[0]+'|'+menu.nombre[1]+'|'+menu.nombre[2]+'|'+menu.nombre[3]+'|Otros platos');
     
},(session,results)=>{
   if ((results.response.entity).includes('Otros'))
   {
       session.endDialog();
    }
   else
   {
    i= menu.nombre.indexOf(results.response.entity);
    var heroCard = new builder.HeroCard(session)
    .title(menu.nombre[i])
    .subtitle(menu.descripcion[i])
    .text('S/. '+(menu.precio[i]).toString())
    .images([
        builder.CardImage.create(session, menu.images[i])
    ]);
    session.send(new builder.Message().addAttachment(heroCard));
    builder.Prompts.confirm(session,'Deseas agregar '+menu.nombre[i]+' a tu pedido?',{listStyle: builder.ListStyle.button});
   }
},(session,results,next)=>{

    if(results.response.toString()==='true')
    {
        var obj={};
        obj.id_carta=menu.id_carta[i];
        obj.nombre=menu.nombre[i];
        obj.cantidad=1;
        obj.precio=menu.precio[i];
        datos.pedido.push(obj);
        session.send("Plato agregado al pedido");
        next();
    }
    else
    {
        session.endDialog();
    }
},(session,results)=>{
 builder.Prompts.confirm(session,'Deseas agregar otro plato más a tu pedido?',{listStyle: builder.ListStyle.button});
},(session,results)=>{
    if(results.response.toString()==='true')
    {
        session.endDialog();
    }
    else
    {
        session.endDialogWithResult({response:false});

    }
}]);


bot.dialog('busqueda',[(session)=>{
    builder.Prompts.text(session,'Escribe el nombre del plato que deseas pedir');

},(session,results)=>{
    rp.post(RequestConfig.PostRequest('/search',{value:results.response})).then(body=>{
        menu=JSON.parse(body);
        if (menu.nombre.length>0)
        {
        var nombres='';
        var attachs=[];
        for(var z=0;z<=menu.nombre.length-1;z++)
        { 
            attachs.push(new builder.HeroCard(session)
                       .title(menu.nombre[z])
                       .images([
                           builder.CardImage.create(session,menu.images[z])
                       ])
                       .buttons([
                            builder.CardAction.imBack(session, menu.nombre[z], "Ver") 
                       ]));
            
            if(z===menu.nombre.length-1)
            {
                nombres+=menu.nombre[z]+'|Otros platos';

            }
            else
            {
                nombres+=menu.nombre[z]+'|';
            }
        }
        attachs.push(new builder.HeroCard(session)
         .title('Buscar otros platos de la Carta')
         .images([
            builder.CardImage.create(session,'https://image.ibb.co/b2CU2H/search_123.png')
        ])                
        .buttons([
            builder.CardAction.postBack(session, 'Otros platos', "Buscar") 
                       ]));
                             
         var msg= new builder.Message(session)
                  .attachmentLayout(builder.AttachmentLayout.carousel)
                  .attachments(attachs);
                  console.log(nombres);
                  session.send('Platos:');
        builder.Prompts.choice(session,msg,nombres);
        }
        else
        {
            session.send("No se encontraron platos con el nombre que escribiste");
            session.replaceDialog('busqueda');
        }
        });
},(session,results)=>{
    if ((results.response.entity).includes('Otros'))
    {
        session.replaceDialog('busqueda');
    }
    else
    {
        console.log(results.response.entity);
        i= menu.nombre.indexOf(results.response.entity);
        var heroCard = new builder.HeroCard(session)
        .title(menu.nombre[i])
        .subtitle(menu.descripcion[i])
        .text('S/. '+(menu.precio[i]).toString())
        .images([
            builder.CardImage.create(session, menu.images[i])
        ]);
        session.send(new builder.Message().addAttachment(heroCard));
        builder.Prompts.confirm(session,'Deseas agregar '+menu.nombre[i]+' a tu pedido?',{listStyle: builder.ListStyle.button});
    }
 },(session,results,next)=>{
 
     if(results.response.toString()==='true')
     {  
        var find = false;
        var index=0;
        for(var x = 0; x < datos.pedido.length; x++) {
            if (datos.pedido[x].nombre ==menu.nombre[i]) {
                find = true;
                index=x;
                break;
            }
        }
         if(find)
         {  
            
            datos.pedido[index].cantidad+=1;
            datos.pedido[index].precio+=menu.precio[i];
            
         }    
         else
         {
                var obj={};
                obj.id_carta=menu.id_carta[i];
                obj.nombre=menu.nombre[i];
                obj.cantidad=1;
                obj.precio=menu.precio[i];
                datos.pedido.push(obj);
         } 
         session.send("Plato agregado al pedido");
         next();
     }
     else
     {
                 session.replaceDialog('busqueda');

     }
 },(session,results)=>{
    builder.Prompts.confirm(session,'Deseas agregar otro plato más a tu pedido?',{listStyle: builder.ListStyle.button});
   },(session,results)=>{
       if(results.response.toString()==='true')
       {
        session.replaceDialog('busqueda');
       }
       else
       {
         session.endDialogWithResult({response:false});
   
       }
   }]);


   bot.dialog('mostrarpedido',[(session)=>{
       datos.total=0;
    for(var c=0;c<datos.pedido.length;c++)
    {
            datos.total+=datos.pedido[c].precio;
    }     
    session.send(new builder.Message().addAttachment(template.ReceiptCard(datos)));
    
    builder.Prompts.choice(session,'Que es lo que quieres hacer?','Registrar Pedido|Modificar Pedido|Cancelar Pedido',{listStyle: builder.ListStyle.button});
   },(session,results)=>{
        if(results.response.entity.includes('Registrar'))
        {
                rp.post(RequestConfig.PostRequest('/delivery',datos)).then(r=>{
                sender.SendEmail(datos);
                session.send('Tu pedido ha sido registrado con éxito.');
                session.send('N° de tu pedido es: '+r);
                session.send('Se te ha enviado un correo electrónico con los detalles de tu pedido');
                session.endDialog();
                }).catch(err=>{
                    session.send('Ocurrio un error inesperado :(');
                });
        }
        else if(results.response.entity.includes('Modificar'))
        {
        
           session.endDialogWithResult({response:'agregar'});
            
        }
        else if(results.response.entity.includes('Cancelar'))
        {    
            builder.Prompts.confirm(session,'Estas seguro?, se perderan los datos de tu pedido',{listStyle: builder.ListStyle.button})
        }
   },(session,results)=>{
    if(results.response.toString()==='true')
    {
        session.endDialog();
    }
    else if(results.response.toString()==='false')
    {
        session.replaceDialog('mostrarpedido');
    }
 
   }]);

   bot.dialog('emailprompt',[(session)=>{
    builder.Prompts.text(session,'Bien '+datos.nomcli+', ahora escribe tu correo electrónico')
    
   },(session,results)=>{
            var mail='';
        (results.response).includes('<a') ? mail=striptags(results.response) : mail=results.response;
        
            console.log(mail);
        if(validator.validate(mail))
        {   
            datos.email=mail;
            session.endDialogWithResult({response:'good'})
        }
        else
        {   
            session.send('Ese es un correo no válido');
            session.replaceDialog('emailprompt');
        }
   }]);

   bot.dialog('observaciones',[(session)=>{
        builder.Prompts.confirm(session,'Deseas agregar algunas observaciones a tu pedido?',{listStyle: builder.ListStyle.button})
   },(session,results)=>{
        if(results.response.toString()==='true')
        {
            builder.Prompts.text(session,'Escribe las observaciones o comentarios que tengas para tu pedido')
        }
        else
        {
            session.endDialog();
        }
   },(session,results)=>{
    datos.obs=results.response;
    session.send('Se agregaron tus Observaciones.');
    session.endDialog();
   }]);



bot.dialog('consulta',(session)=>{
   session.send('Las consultas no estan implementadas :(');
   session.endDialog();
});
