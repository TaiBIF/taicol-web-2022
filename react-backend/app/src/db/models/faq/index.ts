import Faq from './Faq'
import Category from '../Category'

Faq.belongsTo(Category)
Category.hasMany(Faq)


export { Faq,Category }
