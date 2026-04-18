import { Authority } from '../models';
import logger from '../config/logger';

export const seedAuthorities = async () => {
  try {
    const authorities = [
      {
        name: 'Municipal Corporation',
        department: 'Sanitation Department',
        contact: '+1-800-CLEAN-01',
        email: 'sanitation@city.gov',
        region: 'general',
        categories: ['sanitation', 'waste'],
      },
      {
        name: 'Public Works Department',
        department: 'Infrastructure',
        contact: '+1-800-ROADS-01',
        email: 'roads@city.gov',
        region: 'general',
        categories: ['infrastructure', 'roads'],
      },
      {
        name: 'Water Supply Board',
        department: 'Utilities',
        contact: '+1-800-WATER-01',
        email: 'water@city.gov',
        region: 'general',
        categories: ['utilities', 'water'],
      },
      {
        name: 'Electricity Board',
        department: 'Power Supply',
        contact: '+1-800-POWER-01',
        email: 'power@city.gov',
        region: 'general',
        categories: ['utilities', 'electricity'],
      },
      {
        name: 'Safety Department',
        department: 'Public Safety',
        contact: '+1-800-SAFETY',
        email: 'safety@city.gov',
        region: 'general',
        categories: ['safety', 'emergency'],
      },
    ];

    for (const auth of authorities) {
      await Authority.findOrCreate({
        where: { name: auth.name },
        defaults: auth,
      });
    }

    logger.info('✅ Authorities seeded successfully');
  } catch (error) {
    logger.error('Error seeding authorities:', error);
  }
};