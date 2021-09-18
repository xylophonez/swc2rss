const Arweave = require('arweave')
const express = require('express');
const RSS = require('rss');
const { SmartWeaveNodeFactory, LoggerFactory } = require("redstone-smartweave");

const arweave = Arweave.init({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
      logging: false,
    });

const smartweave = SmartWeaveNodeFactory.memCached(arweave);
LoggerFactory.INST.logLevel('fatal')
const app = express()
const port = 3000

// MPxtQl63-lAg6QcSY5Ftfv5D5NRW_VDHW4RAlc15eIY/Cv6J7sf5kr-Sh44Ho7usCUVeXfbaQlCpyRpIjVu59Qg

// cId:
// MPxtQl63-lAg6QcSY5Ftfv5D5NRW_VDHW4RAlc15eIY
// pId:
// Cv6J7sf5kr-Sh44Ho7usCUVeXfbaQlCpyRpIjVu59Qg

const findPodcast = async (params) => {
      let contractId = params.contractId;
      let podcastId = params.podcastId;
      const contract = smartweave
      .contract(contractId)
      const result = await contract.readState();
      const podcasts = result.state.podcasts;
      for (let i in podcasts) {
            if (podcasts[i].pid === podcastId) {
                  console.log(podcasts[i])
                  return generateRss(podcasts[i])
            }
      }
}

const blockheightToDate = (bh) => {
      let epoch = 1528451997;
      let date = epoch + (bh / 720 * 24 * 3600);
      return date;
}

const generateRss = (p) => {
      
      let feed = new RSS({
            title: p.podcastName,
            description: p.description,
            image_url: `arweave.net/${p.cover}`,
      })

      for (let i in p.episodes) {
            let e = p.episodes[i];
            console.log(e)
            feed.item({
                  title: e.episodeName,
                  description: e.description,
                  url: `https://arweave.net/${e.audioTx}`,
                  guid: e.eid,
                  date: blockheightToDate(e.uploadedAt)
            })

      }

      let xml = feed.xml();
      console.log(xml)
      return xml
}


app.get('/:contractId/:podcastId', (req, res) => {
      res.send(findPodcast(req.params));
});

app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
})

