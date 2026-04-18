import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// User Model
export class User extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public role!: 'citizen' | 'volunteer' | 'admin';
  public phone?: string;
  public location?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('citizen', 'volunteer', 'admin'),
      defaultValue: 'citizen',
    },
    phone: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

// Issue Model
export class Issue extends Model {
  public id!: string;
  public userId!: string;
  public description!: string;
  public category!: string;
  public urgency!: 'low' | 'medium' | 'high';
  public status!: 'open' | 'in_progress' | 'resolved' | 'closed';
  public location?: object;
  public images?: string[];
  public metadata?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Issue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    urgency: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open',
    },
    location: {
      type: DataTypes.JSONB,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    metadata: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize,
    tableName: 'issues',
  }
);

// Suggestion Model
export class SuggestionModel extends Model {
  public id!: string;
  public issueId!: string;
  public actionType!: string;
  public title!: string;
  public description!: string;
  public confidence!: number;
  public explanation!: string;
  public priority!: number;
  public metadata?: object;
  public selected!: boolean;
  public readonly createdAt!: Date;
}

SuggestionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    issueId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'issues',
        key: 'id',
      },
    },
    actionType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
    },
    selected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'suggestions',
  }
);

// Authority Model
export class Authority extends Model {
  public id!: string;
  public name!: string;
  public department!: string;
  public contact!: string;
  public email!: string;
  public region!: string;
  public categories!: string[];
}

Authority.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
  },
  {
    sequelize,
    tableName: 'authorities',
  }
);

// Define associations
User.hasMany(Issue, { foreignKey: 'userId', as: 'issues' });
Issue.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Issue.hasMany(SuggestionModel, { foreignKey: 'issueId', as: 'suggestions' });
SuggestionModel.belongsTo(Issue, { foreignKey: 'issueId', as: 'issue' });

export { sequelize };