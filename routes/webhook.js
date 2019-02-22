var express = require('express');
var WebHooks = require('node-webhooks');
var router = express.Router();
var webhook = require('../webhook');

/* GET home page. */
router.post('/dcsvm', function(req, res, next) {
    var content = req.body.data.context;
    var name = content.name;
    var allCond = content.condition.allOf[0];
    var subtitle = `${allCond.metricName} is ${allCond.operator} ${allCond.threshold} on ${allCond.timeAggregation}`;
    var dimensions = allCond.dimensions;
    dimensions.push({
        "name": "Actual Percentage",
        "value": allCond.metricValue
    });
    
    var card = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": name,
        "sections": [{
            "activityTitle": name,
            "activitySubtitle": subtitle,
            // "activityImage": "https://teamsnodesample.azurewebsites.net/static/img/image5.png",
            "facts": dimensions,
            "markdown": true
        }],
        "potentialAction": [{
            "@type": "OpenUri",
            "name": "Go to Portal",
            "targets": [
                { "os": "default", "uri": content.portalLink }
            ]
        }]
    };
    webhook.trigger('msteam4vmss', card);
    res.json(dimensions);
});

module.exports = router;
