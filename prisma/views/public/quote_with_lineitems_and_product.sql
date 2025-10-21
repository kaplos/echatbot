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
  (
    SELECT
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
            'BuyerComment',
            li."BuyerComment",
            'product',
            to_jsonb(s.*)
          )
        )
      ) AS jsonb_agg
    FROM
      (
        "lineItems" li
        LEFT JOIN sample_with_stones_export s ON ((s.sample_id = li."productId"))
      )
    WHERE
      (li."quoteNumber" = q."quoteNumber")
  ) AS lineitems
FROM
  quotes q;