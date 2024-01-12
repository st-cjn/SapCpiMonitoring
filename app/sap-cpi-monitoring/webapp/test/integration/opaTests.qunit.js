sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'sapcpimonitoring/test/integration/FirstJourney',
		'sapcpimonitoring/test/integration/pages/QueueList',
		'sapcpimonitoring/test/integration/pages/QueueObjectPage'
    ],
    function(JourneyRunner, opaJourney, QueueList, QueueObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('sapcpimonitoring') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheQueueList: QueueList,
					onTheQueueObjectPage: QueueObjectPage
                }
            },
            opaJourney.run
        );
    }
);