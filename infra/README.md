# AWS 部署

Phaser 游戏使用以下结构部署：

- 私有 S3 Bucket 保存 `phaser3-game/dist`。
- CloudFront 通过 Origin Access Control 读取 S3，并提供 HTTPS 地址。
- GitHub 只用于保存源代码，AWS 部署由本机脚本手动执行。

## 首次部署

本机需要已经登录 AWS CLI，并拥有更新 CloudFormation、S3 和 CloudFront 资源的权限。

```bash
./infra/deploy.sh
```

脚本会创建或更新 CloudFormation 栈、运行 Phaser 测试和构建、上传 S3，并刷新 CloudFront 缓存。以后每次需要发布新版本时，重新执行同一条命令即可。

CloudFormation 默认使用 `us-east-1`，也可以在首次运行前指定：

```bash
AWS_REGION=ap-southeast-1 ./infra/deploy.sh
```
