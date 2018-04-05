module.exports.SendEmail=function(obj){
var nodemailer = require('nodemailer');
var msj='';
console.log(obj.email);
msj+='<h1>DETALLES DEL PEDIDO</h1><br><p>CLIENTE: '+obj.nombre+'</p><br><p>DIRECCION: '+obj.direccion+'</p><br><table><tr><td>PLATO</td><td>CANTIDAD</td><td>PRECIO</td></tr>';

obj.pedido.forEach(element => {
  
  msj+='<tr><td>'+element.nombre+'</td><td>'+element.cantidad+'</td><td>S/.'+element.precio+'</td></tr>';
});


msj+='</table><br><p>TOTAL DEL PEDIDO: S/.'+obj.total+'</p><br><p>OBSERVACIONES:'+obj.obs+'</p>';
var transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: 'luis.castillo@cmscloud.pe',
      pass: 'Lmcb482115321994'
    }
  });
  
  
  var mailOptions = {
    from: 'luis.castillo@cmscloud.pe',
    to: obj.email,
    subject: 'Detalles de PEDIDOS-BOT',
    html:msj
 };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}