// 首页摘要：无 <!-- more --> 时自动提取正文前两段作为 excerpt
// 主题 _macro/post.ejs 会优先使用 description > excerpt，均无则显示全文
var EXCERPT_PARAGRAPHS = 2;

hexo.extend.filter.register('after_post_render', function (data) {
  if (data.source.indexOf('_posts/') !== 0) return;
  if (data.excerpt) return; // 已有 <!-- more --> 摘要则不处理

  var paras = data.content.match(/<p[\s\S]*?<\/p>/g);
  if (!paras || !paras.length) return;

  data.excerpt = paras.slice(0, EXCERPT_PARAGRAPHS).join('\n');
});
