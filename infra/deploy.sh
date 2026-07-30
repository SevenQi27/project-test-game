#!/usr/bin/env bash

set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-project-test-game}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "${script_dir}/.." && pwd)"

aws cloudformation deploy \
  --region "${AWS_REGION}" \
  --stack-name "${STACK_NAME}" \
  --template-file "${script_dir}/cloudformation.yml" \
  --no-fail-on-empty-changeset

site_bucket="$(aws cloudformation describe-stacks \
  --region "${AWS_REGION}" \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='SiteBucketName'].OutputValue" \
  --output text)"
distribution_id="$(aws cloudformation describe-stacks \
  --region "${AWS_REGION}" \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
  --output text)"
site_url="$(aws cloudformation describe-stacks \
  --region "${AWS_REGION}" \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='SiteUrl'].OutputValue" \
  --output text)"
npm ci --prefix "${project_dir}/phaser3-game"
npm test --prefix "${project_dir}/phaser3-game"

aws s3 sync \
  "${project_dir}/phaser3-game/dist/" \
  "s3://${site_bucket}/" \
  --region "${AWS_REGION}" \
  --delete \
  --exclude index.html \
  --cache-control "public,max-age=3600"

aws s3 cp \
  "${project_dir}/phaser3-game/dist/index.html" \
  "s3://${site_bucket}/index.html" \
  --region "${AWS_REGION}" \
  --content-type text/html \
  --cache-control "no-cache,no-store,must-revalidate"

aws cloudfront create-invalidation \
  --distribution-id "${distribution_id}" \
  --paths '/*' >/dev/null

printf 'Site URL: %s\n' "${site_url}"
