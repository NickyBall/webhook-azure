require('dotenv').config();
var express = require('express');
var WebHooks = require('node-webhooks');
var router = express.Router();
var webhook = require('../webhook');
var axios = require('axios');

router.post('/dcsvm', function (req, res, next) {
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
            "targets": [{
                "os": "default",
                "uri": content.portalLink
            }]
        }]
    };
    webhook.trigger('msteam4vmss', card);
    res.end();
});

router.post('/appinsight', function (req, res, next) {
    axios.get(`${process.env.APP_INSIGHT_API_URL}/${process.env.APP_INSIGHT_API_VERSION}/apps/${process.env.APP_INSIGHT_ID}/events/exceptions?$top=1`, {
        headers: {
            "x-api-key": process.env.APP_INSIGHT_KEY
        }
    }).then(response => {
        var content = req.body.data.context;
        var name = content.name;
        var allCond = content.condition.allOf[0];
        var subtitle = `${allCond.metricName} is ${allCond.operator} ${allCond.threshold} on ${allCond.timeAggregation}`;
        var dimensions = allCond.dimensions;
        dimensions.push({
            "name": "Number of Occurances",
            "value": allCond.metricValue
        });

        var facts = response.data.value.map(val => {
            return [{
                    "name": "ListenerName",
                    "value": val.customDimensions.ListenerName
                },
                {
                    "name": "Username",
                    "value": val.customDimensions.Username
                },
                {
                    "name": "ComputerName",
                    "value": val.customDimensions.ComputerName
                },
                {
                    "name": "ComputerGUID",
                    "value": val.customDimensions.ComputerGuid
                },
                {
                    "name": "Type",
                    "value": val.exception.type
                },
                {
                    "name": "Method",
                    "value": val.exception.method
                },
                {
                    "name": "Outer Method",
                    "value": val.exception.outerMethod
                },
                {
                    "name": "Outer Message",
                    "value": val.exception.outerMessage
                }
            ];
        });

        for (var i = 0; i < facts.length; i++) {
            var fact = facts[i];
            var card = {
                "@type": "MessageCard",
                "@context": "http://schema.org/extensions",
                "themeColor": "0076D7",
                "summary": name,
                "sections": [{
                    "activityTitle": name,
                    "activitySubtitle": subtitle,
                    // "activityImage": "https://teamsnodesample.azurewebsites.net/static/img/image5.png",
                    "facts": fact,
                    "markdown": true
                }],
                "potentialAction": [{
                    "@type": "OpenUri",
                    "name": "Go to Portal",
                    "targets": [{
                        "os": "default",
                        "uri": content.portalLink
                    }]
                }]
            };
            webhook.trigger('msteam4ai', card);
        }
        res.end();
    }).catch(err => {
        console.log(err)
    });


});

router.post('/vsts', function (req, res, next) {

    var content = req.body;
    var name = content.message.text;
    var subtitle = "Trigger from Azure DevOps";
    var facts = [];
    if (content.eventType === "git.push") {
        facts = [
            {
                "name": "Message",
                "value": name + " Service กำลังอยู่ในขั้นตอนของการ Build"
            }
        ];
    } else if (content.eventType === "build.complete") {
        facts = [
            {
                "name": "Message",
                "value": "Build สำเร็จ!! ขณะนี้ Service ไม่สามารถใช้งานได้"
            },
            {
                "name": "Build Number",
                "value": content.resource.buildNumber
            }
        ];
    } else if (content.eventType === "ms.vss-release.deployment-completed-event") {
        facts = [
            {
                "name": "Message",
                "value": "DCS Service สามารถใช้งานได้แล้ว"
            },
            {
                "name": "Release Id",
                "value": content.resource.environment.name + " - " + content.resource.environment.releaseId
            }
        ];
    }

    var card = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": name,
        "sections": [{
            "activityTitle": name,
            "activitySubtitle": subtitle,
            // "activityImage": "https://teamsnodesample.azurewebsites.net/static/img/image5.png",
            "facts": facts,
            "markdown": true
        }],
        "potentialAction": [{
            "@type": "OpenUri",
            "name": "Go to Portal",
            "targets": [{
                "os": "default",
                "uri": content.portalLink
            }]
        }]
    };
    webhook.trigger('msteam4ts', card);
    res.end();
});

module.exports = router;