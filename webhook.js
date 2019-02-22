var WebHooks = require('node-webhooks');

// Initialize webhooks module from on-disk database
var webHooks = new WebHooks({
    db: './webHooksDB.json', // json file that store webhook URLs
    httpSuccessCodes: [200, 201, 202, 203, 204], //optional success http status codes
});

webHooks.add('webhooksite', 'https://webhook.site/1ccd7a86-6955-4b46-92f0-142f94f6887b').then(function(){
// done
}).catch(function(err){
    console.log(err)
});

webHooks.add('msteam4vmss', 'https://outlook.office.com/webhook/e5919028-b41e-4efb-bfec-62564e26becf@1bf12a4f-2277-4d37-83db-525780663f76/IncomingWebhook/2922d7754e884e678a3b5564fa0c107b/b89b96b3-7b9a-4d34-ae36-e83156f15335').then(function(){
// done
}).catch(function(err){
    console.log(err)
});

webHooks.add('msteam4ai', 'https://outlook.office.com/webhook/e5919028-b41e-4efb-bfec-62564e26becf@1bf12a4f-2277-4d37-83db-525780663f76/IncomingWebhook/5fa7d887b43245348822703c55b3a4bc/b89b96b3-7b9a-4d34-ae36-e83156f15335').then(function(){
// done
}).catch(function(err){
    console.log(err)
});

module.exports = webHooks;