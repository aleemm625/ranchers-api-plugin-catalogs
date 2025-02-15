import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name catalogItems
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Catalog by shop ID and/or tag ID
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String[]} [params.searchQuery] - Optional text search query
 * @param {String[]} [params.shopIds] - Shop IDs to include (OR)
 * @param {String[]} [params.tags] - Tag IDs to include (OR)
 * @param {Boolean} [params.isBanner] - Tag IDs to include (OR)
 * @returns {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function catalogItems(context, params) {
  const { searchQuery, shopIds, tagIds, isBanner, catalogBooleanFilters } =
    params;
  const { collections } = context;
  const { Catalog } = collections;

  if ((!shopIds || shopIds.length === 0) && (!tagIds || tagIds.length === 0)) {
    throw new ReactionError(
      "invalid-param",
      "You must provide tagIds or shopIds or both"
    );
  }

  const query = {
    "product.isDeleted": { $ne: true },
    ...catalogBooleanFilters,
    "product.isVisible": true,
  };

  if (shopIds) query.shopId = { $in: shopIds };
  if (tagIds) query["product.tagIds"] = { $in: tagIds };
  console.log("tagIds ", tagIds);

  if (searchQuery) {
    query.$text = {
      $search: _.escapeRegExp(searchQuery),
    };
  }
  if (isBanner) query["product.slug"] = { $ne: "two-for-you" };
  console.log("isBanner ", isBanner);
  console.log("query ", query);

  return Catalog.find({ ...query });
}
