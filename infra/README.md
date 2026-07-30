# AWS 部署

Phaser 游戏使用以下结构部署：

- 私有 S3 Bucket 保存 `phaser3-game/dist`。
- CloudFront 通过 Origin Access Control 读取 S3，并提供 HTTPS 地址。
- GitHub Actions 通过 OIDC 获取临时 AWS 凭证，不保存长期 Access Key。

## 首次部署

本机需要已经登录 AWS CLI，并拥有创建 CloudFormation、S3、CloudFront 和 IAM 资源的权限。

```bash
./infra/deploy.sh
```

脚本完成后，将输出的角色 ARN 保存为 GitHub 仓库变量 `AWS_ROLE_ARN`：

```bash
gh variable set AWS_ROLE_ARN --repo SevenQi27/project-test-game --body '<role-arn>'
```

## 后续部署

推送 `phaser3-game`、部署工作流或基础设施相关改动到 `main` 后，GitHub Actions 会重新测试、构建并发布游戏。

CloudFormation 默认使用 `us-east-1`，也可以在首次运行前指定：

```bash
AWS_REGION=ap-southeast-1 ./infra/deploy.sh
```
