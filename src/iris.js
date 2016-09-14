import Resource from 'resource';
import getExtractor from 'extractors/get-extractor';
import RootExtractor from 'extractors/root-extractor';
import collectAllPages from 'extractors/collect-all-pages';

const Iris = {
  async parse(url, html, opts = {}) {
    const { fetchAllPages = true } = opts || true;
    const Extractor = getExtractor(url);
    console.log(`Using extractor for ${Extractor.domain}`);

    const $ = await Resource.create(url, html);
    html = $.html();

    // Cached value of every meta name in our document.
    // Used when extracting title/author/date_published/dek
    const metaCache = $('meta').map((_, node) => $(node).attr('name')).toArray();

    let result = this.runExtraction(Extractor, { url, html, $, metaCache });
    const { title, nextPageUrl } = result;

    if (fetchAllPages && nextPageUrl) {
      result = await collectAllPages(
        {
          Extractor,
          nextPageUrl,
          html,
          $,
          metaCache,
          result,
          title,
          url,
        }
      );
    }

    return result;
  },

  runExtraction(Extractor, opts) {
    return RootExtractor.extract(Extractor, opts);
  },

};

export default Iris;