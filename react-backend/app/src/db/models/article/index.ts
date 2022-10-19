import Article from './Article'
import Category from '../Category'

Article.belongsTo(Category)
Category.hasMany(Article)


export { Article,Category }
