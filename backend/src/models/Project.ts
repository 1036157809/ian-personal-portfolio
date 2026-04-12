import { DataTypes, Model } from 'sequelize';

class Project extends Model {
  public id!: number;
  public title!: string;
  public titleZh!: string;
  public description!: string;
  public descriptionZh!: string;
  public technologies!: string;
  public imageUrl!: string;
  public mobileImageUrl!: string;
  public additionalImages!: string;
  public demoUrl!: string;
  public githubUrl!: string;
  public order!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: any) => {
  Project.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      titleZh: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      descriptionZh: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      technologies: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          const value = this.getDataValue('technologies');
          return value ? JSON.parse(value) : [];
        },
        set(value: string[]) {
          this.setDataValue('technologies', JSON.stringify(value));
        },
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobileImageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      additionalImages: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const value = this.getDataValue('additionalImages');
          return value ? JSON.parse(value) : [];
        },
        set(value: string[]) {
          this.setDataValue('additionalImages', JSON.stringify(value));
        },
      },
      demoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      githubUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Project',
    }
  );

  return Project;
};
