#!/usr/bin/env bash

set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-project-test-game}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-SevenQi27/project-test-game}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "${script_dir}/.." && pwd)"

oidc_provider_arn=""
while IFS= read -r provider_arn; do
  [[ -z "${provider_arn}" ]] && continue
  provider_url="$(aws iam get-open-id-connect-provider \
    --open-id-connect-provider-arn "${provider_arn}" \
    --query Url \
    --output text)"
  if [[ "${provider_url}" == "token.actions.githubusercontent.com" ]]; then
    oidc_provider_arn="${provider_arn}"
    break
  fi
done < <(aws iam list-open-id-connect-providers \
  --query 'OpenIDConnectProviderList[].Arn' \
  --output text | tr '\t' '\n')

parameters=(
  "GitHubRepository=${GITHUB_REPOSITORY}"
  "GitHubBranch=${GITHUB_BRANCH}"
)

if [[ -n "${oidc_provider_arn}" ]]; then
  parameters+=("ExistingGitHubOidcProviderArn=${oidc_provider_arn}")
fi

aws cloudformation deploy \
  --region "${AWS_REGION}" \
  --stack-name "${STACK_NAME}" \
  --template-file "${script_dir}/cloudformation.yml" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides "${parameters[@]}" \
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
role_arn="$(aws cloudformation describe-stacks \
  --region "${AWS_REGION}" \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='GitHubDeployRoleArn'].OutputValue" \
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
printf 'GitHub Actions variable: AWS_ROLE_ARN=%s\n' "${role_arn}"
