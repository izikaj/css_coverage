const NAMESPACE_RULES = [
  {
    test: /^\/$/i,
    lookup: 'critical/welcome.css',
  },
  {
    test: /services?/i,
    lookup: 'critical/services.css',
  },
  {
    test: /(blogs?|posts?|tips)/i,
    lookup: 'critical/posts.css',
  },
  {
    test: /samples?/i,
    lookup: 'critical/samples.css',
  },
  {
    test: /prices?/i,
    lookup: 'critical/prices.css',
  },
  {
    test: /(review|testimonial)s?/i,
    lookup: 'critical/testimonials.css',
  },
  {
    test: /writers?/i,
    lookup: 'critical/writers.css',
  },
  {
    test: /auth?/i,
    lookup: 'critical/auth.css',
  },
  {
    test: /orders?/i,
    lookup: 'critical/orders.css',
  },
  {
    test: /evaluations?/i,
    lookup: 'critical/evaluations.css',
  },
];

function customGroups({ similar, computed }) {
  for (const group of similar) {
    for (const rule of NAMESPACE_RULES) {
      let pass = true;
      for (const link of group) {
        if (!rule.test.test(link)) {
          pass = false;
          break;
        }
      }
      if (pass) {
        const { count, paths } = computed[rule.lookup] || { count: 0, paths: [] };
        computed[rule.lookup] = {
          count: count + group.length,
          paths: [...paths, ...group],
        }
      }
    }
  }
}

module.exports = customGroups;
