

module.exports.ReturnCard=function(obj){
data=[];


for(var c=0;c<obj.pedido.length;c++)
{
    // for(var i=0;i<=obj.pedido.cantidad;i++)
    //      {   
             data.push({
             "title": obj.pedido[c].nombre,
             "value": obj.pedido[c].id_carta
             });

}


return ({
    contentType: "application/vnd.microsoft.card.adaptive",
    content: {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.0",
        "body": [{
            "type": "TextBlock",
            "text": "Marca los platos que quieres eliminar:"
        },{
            "type": "Input.ChoiceSet",
            "id": "Platos",
            "isMultiSelect": true,
            "style": "expanded",
            "choices": data
            
        }

        ],
        "actions": [
            {
                "type": "Action.Submit",
                "title": "Modificar"
            }]
}
});
}

module.exports.ReceiptCard=function(obj){
var data=[];
var total=0;

data.push({
    "type": "TextBlock",
    "text": "Resumen de su pedido:",
    "weight": "bolder",
    "isSubtle": false
  });
data.push({
    "type": "TextBlock",
    "text": "Cliente: "+obj.nombre,
    "weight": "bolder",
    "isSubtle": false
  });
  data.push({
    "type": "TextBlock",
    "spacing": "none",
    "text": "Dirección: "+obj.direccion,
    "isSubtle": true
  });
  data.push({
    "type": "ColumnSet",

    "columns": [
      
      {
        "type": "Column",
        "width": "auto",
        "items": [
          {
            "type": "TextBlock",
            "text": "N",
            "size": "small",
            "isSubtle": true
          }
        ]
      },
      {
        "type": "Column",
        "width": "1",
        "items": [
          {
            "type": "TextBlock",
            "text": "Nombre del plato",
            "spacing": "none",
            "size": "small",
            "isSubtle": true
          }
        ]
      },
      {
        "type": "Column",
        "width": 1,
        "items": [
          {
            "type": "TextBlock",
            "horizontalAlignment": "right",
            "size": "small",
            "text": "Precio",
            "isSubtle": true
          }
        ]
      }
    ]
  });


    for(var c=0;c<obj.pedido.length;c++)
    {

        data.push({
            "type": "ColumnSet",
            "separator": true,
            "columns": [
                {
                    "type": "Column",
                    "width": "auto",
                    "items": [
                      {
                        "type": "TextBlock",
                        "text": ''+obj.pedido[c].cantidad,
                        "isSubtle": true
                      }
                    ]
                  },
                  {
                    "type": "Column",
                    "width": "1",
                    "items": [
                  
                      {
                        "type": "TextBlock",
                        "text": ''+obj.pedido[c].nombre,
                        "spacing": "none"
                      }
                    ]
                  },
                  {
                    "type": "Column",
                    "width": 1,
                    "items": [
                      {
                        "type": "TextBlock",
                        "horizontalAlignment": "right",
                        "text": "S/. "+obj.pedido[c].precio,
                        "isSubtle": true
                      }
                    ]
                }
            ]
          })
            total+=obj.pedido[c].precio;
    }  
data.push({
        "type": "ColumnSet",
        "separator": true,
        "spacing": "medium",
        "columns": [
          {
            "type": "Column",
            "width": "1",
            "items": [
              {
                "type": "TextBlock",
                "text": "Total",
                "size": "medium",
                "isSubtle": true
              }
            ]
          },
          {
            "type": "Column",
            "width": 1,
            "items": [
              {
                "type": "TextBlock",
                "horizontalAlignment": "right",
                "text": ''+total,
                "size": "medium",
                "weight": "bolder"
              }
            ]
          }
        ]
})


    

    return({
        contentType: "application/vnd.microsoft.card.adaptive",
    content: {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.0",
        "type": "AdaptiveCard",
        "speak": "",
        "body": data,
  "actions": [
    {
      "type": "Action.ShowCard",
      "title": "Observaciones",
      "card": {
        "type": "AdaptiveCard",
        "body": [
             
                {
                    "type": "TextBlock",
                    "text": ""+obj.obs,
                    "wrap": true
                  }
              
             ]
            }
        }
    ]
}
})


}