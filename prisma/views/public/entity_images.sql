WITH image_groups AS (
  SELECT
    il."entityId",
    il.entity,
    il.type,
    COALESCE(
      array_agg(
        i."imageUrl"
        ORDER BY
          i."imageUrl"
      ),
      ARRAY [] :: text []
    ) AS urls
  FROM
    (
      image_link il
      LEFT JOIN images i ON ((i.id = il."imageId"))
    )
  GROUP BY
    il."entityId",
    il.entity,
    il.type
)
SELECT
  image_groups."entityId",
  image_groups.entity,
  COALESCE(
    max(image_groups.urls) FILTER (
      WHERE
        (image_groups.type = 'image' :: text)
    ),
    ARRAY [] :: text []
  ) AS images,
  COALESCE(
    max(image_groups.urls) FILTER (
      WHERE
        (image_groups.type = 'cad' :: text)
    ),
    ARRAY [] :: text []
  ) AS cad
FROM
  image_groups
GROUP BY
  image_groups."entityId",
  image_groups.entity;