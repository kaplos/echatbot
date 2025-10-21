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
  ig."entityId",
  ig.entity,
  COALESCE(
    (
      SELECT
        image_groups.urls
      FROM
        image_groups
      WHERE
        (
          (image_groups.type = 'image' :: text)
          AND (image_groups."entityId" = ig."entityId")
          AND (image_groups.entity = ig.entity)
        )
    ),
    ARRAY [] :: text []
  ) AS images,
  COALESCE(
    (
      SELECT
        image_groups.urls
      FROM
        image_groups
      WHERE
        (
          (image_groups.type = 'cad' :: text)
          AND (image_groups."entityId" = ig."entityId")
          AND (image_groups.entity = ig.entity)
        )
    ),
    ARRAY [] :: text []
  ) AS cad
FROM
  (
    SELECT
      DISTINCT image_groups."entityId",
      image_groups.entity
    FROM
      image_groups
  ) ig;