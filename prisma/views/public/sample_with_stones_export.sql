SELECT
  samples.id AS sample_id,
  samples."styleNumber",
  samples.name,
  samples.collection AS sample_collection,
  samples.category AS sample_category,
  samples.notes,
  samples.status AS sample_status,
  samples.created_at,
  samples.updated_at,
  samples."salesWeight",
  samples.starting_info_id,
  samples.selling_pair,
  samples.back_type,
  samples.custom_back_type,
  samples.back_type_quantity,
  samples."designId" AS sample_design_id,
  starting_info."manufacturerCode",
  starting_info.description AS starting_description,
  starting_info.karat,
  starting_info."metalType",
  starting_info.color,
  starting_info.vendor,
  starting_info."platingCharge",
  starting_info.length,
  starting_info.width,
  starting_info.height,
  starting_info.weight,
  starting_info.plating,
  starting_info."miscCost",
  starting_info."laborCost",
  starting_info."designId" AS starting_design_id,
  starting_info."totalCost",
  starting_info.necklace,
  starting_info."necklaceCost",
  starting_info.collection AS starting_collection,
  starting_info.category AS starting_category,
  stones.id AS stone_id,
  stones.type AS stone_type,
  stones."customType",
  stones.color AS stone_color,
  stones.shape AS stone_shape,
  stones.size AS stone_size,
  stones.quantity AS stone_quantity,
  stones.cost AS stone_cost,
  stones.notes AS stone_notes,
  COALESCE(entity_images.images, ARRAY [] :: text []) AS images,
  COALESCE(entity_images.cad, ARRAY [] :: text []) AS cad
FROM
  (
    (
      (
        samples
        JOIN starting_info ON ((samples.starting_info_id = starting_info.id))
      )
      LEFT JOIN stones ON (
        (
          stones.starting_info_id = samples.starting_info_id
        )
      )
    )
    LEFT JOIN entity_images ON (
      (
        (
          entity_images."entityId" = (samples.starting_info_id) :: numeric
        )
        AND (entity_images.entity = 'starting_info' :: text)
      )
    )
  );