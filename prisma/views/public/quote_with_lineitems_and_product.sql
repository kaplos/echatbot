WITH aggregated_lineitems AS (
  SELECT
    li."quoteNumber",
    jsonb_agg(
      jsonb_strip_nulls(
        jsonb_build_object(
          'lineItemId',
          li.id,
          'productId',
          li."productId",
          'retailPrice',
          li."retailPrice",
          'salesPrice',
          li."salesPrice",
          'margin',
          li.margin,
          'totalCost',
          li."totalCost",
          'quantity',
          li."Quantity",
          'internalNote',
          li."internalNote",
          'buyerComment',
          li."BuyerComment",
          'product',
          to_jsonb(s.*)
        )
      )
      ORDER BY
        li.id
    ) FILTER (
      WHERE
        (li.id IS NOT NULL)
    ) AS lineitems
  FROM
    (
      "lineItems" li
      LEFT JOIN sample_with_stones_export s ON ((s.sample_id = li."productId"))
    )
  GROUP BY
    li."quoteNumber"
)
SELECT
  q.id,
  q."quoteNumber",
  q."quoteTotal",
  q.status,
  q.tags,
  q.gold,
  q.silver,
  q.agent,
  q.buyer,
  q."bulkMargin",
  q.multiplier,
  q.created_at,
  q.updated_at,
  COALESCE(al.lineitems, '[]' :: jsonb) AS lineitems
FROM
  (
    quotes q
    LEFT JOIN aggregated_lineitems al ON ((al."quoteNumber" = q."quoteNumber"))
  );