const i18n = require('i18n');

const Dao = require('../utils/dao.js');
const commonUtil = require('../utils/common.js');
const dbUtil = require('../utils/db.js');

class CategoriesService {
  /**
   * 获取分类
   * @param {integer} id 分类ID
   * @returns {object} 分类
   */
  async getCategoryById(id) {
    const categoriesDao = new Dao('tb_category');
    const category = categoriesDao.findOne(id);
    return category;
  }


  /**
   * 获取所有分类
   * @returns [] 分类数组
   */
  async getCategories() {
    const categoriesDao = new Dao();
    categoriesDao.setTable('tb_category');

    const obj = {
      where:{ is_show:1 },
      order: {id:'asc'}
    };

    const categories = await categoriesDao.findAll(obj);
    return categories;
  }
  
  
  /**
   * 获取分类和其子分类 ID 组成的数组
   * @param {*} parentId 
   * @param {*} allCategories 
   * @returns array
   */
  async getCategoryChildrenIds(parentId, allCategories) {
    if (parentId == 0) {
      return allCategories.map(c => { return c.id });
    }
    var ids = [parentId];
    var categoryChildren = commonUtil.getChildren(allCategories, parentId);
    if (categoryChildren) {
      ids.push(...categoryChildren.map(c => { return c.id }));
    }
    return ids;
  }


  /**
   * 获取所有分类
   * @returns [] 分类数组
   */
  async getCategoriesTree() {
    let categories = await this.getCategories();
    categories = commonUtil.getChildrenTree(categories, 0);
    return categories;
  }


  /**
   * 添加标签
   */
  async store(category) {
    delete category.id;
    category.created_at = commonUtil.formatDateTime();

    const categoriesDao = new Dao('tb_category');

    if (category.parent_id) {
      let parentCategory = await categoriesDao.findOne(category.parent_id);
      if (!parentCategory) {
        throw new Error(i18n.__('parent category is not exist'));
      }
    }

    const result = await categoriesDao.save(category);
    return result;
  }


  async update(category) {
    if (!category.id) throw Error(i18n.__('category id is not valid'));

    const categoriesDao = new Dao('tb_category');

    if (category.parent_id) {
      let parentCategory = await categoriesDao.findOne(category.parent_id);
      if (!parentCategory) {
        throw new Error(i18n.__('parent category is not exist'));
      }
    }

    // 父分类设置错误：1，不可设置自己为父分类
    if (category.id == category.parent_id) {
      throw new Error(i18n.__('parent id can not be itself'));
    }

    // 父分类设置错误：2，不可设置自己的子分类为父分类
    var allCats = await this.getCategories();
    var children = await this.getChildren(allCats, category.id);
    var childrenIds = children.map(c => c.id);
    if (childrenIds.indexOf(category.parent_id) >= 0) {
      throw new Error(i18n.__('parent category must not be subcategory'));
    }

    const result = await categoriesDao.update(category);
    return result;
  }


  /**
   * 删除标签
   * @param {integer} tagId 标签ID
   * @returns {object} ResultSetHeader {
   *                    fieldCount: 0,
   *                    affectedRows: 1,
   *                    insertId: 0,
   *                    info: '',
   *                    serverStatus: 2,
   *                    warningStatus: 0
   *                  }
   */
  async destroy(id) {
    let sql = `SELECT id FROM tb_category WHERE id=:id`;
    let [result, fields] = await dbUtil.execute(sql, { id });
    if (result.length === 0) {
      return;
    }

    // 分类下有子分类不可删除
    sql = `SELECT * FROM tb_category WHERE parent_id=:id LIMIT 1`;
    [result, fields] = await dbUtil.execute(sql, { id });
    if (result.length > 0) {
      throw Error(i18n.__('subcategories are not allowed'));
    }

    // 分类下有文章不可删除
    sql = `SELECT * FROM tb_article_to_category WHERE category_id=:id LIMIT 1`;
    [result, fields] = await dbUtil.execute(sql, { id });
    if (result.length > 0) {
      throw Error(i18n.__('no articles allowed under category'));
    }

    sql = `DELETE FROM tb_category WHERE id=:id`;
    [result, fields] = await dbUtil.execute(sql, { id: id });
    return result;
  }


  /**
   * 获取分类信息
   * @param {integer} id 分类ID
   * @returns {object} category 对象； null； 
   */
  async show(id) {
    let sql = 'SELECT * FROM tb_category WHERE id=:id';
    let category = await dbUtil.execute(sql, { id });
    return category.length ? category[0] : null;
  }


  /**
   * 递归获取所有层级的子分类
   * @param {array} all 所有分类
   * @param {integer} parentId 父分类ID
   * @returns {array}
   */
  getChildren(all, parentId) {
    var children = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].parent_id == parentId) {
        children.push(all[i]);
        children.push(...this.getChildren(all, all[i].id));
      }
    }
    return children;
  }




}

module.exports = CategoriesService;
