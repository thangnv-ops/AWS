# AWS Elastic Beanstalk Node.js sample

Code mau cho environment `Thangnv-beanstalk-env`.

AWS CLI da check duoc environment hien tai:

- Region: `ap-southeast-1`
- Application: `thangnv-beanstalk`
- Platform: `Node.js 24 running on 64bit Amazon Linux 2023/6.11.1`
- Status: `Ready`
- Health luc kiem tra: `Red`
- Endpoint: `http://13.228.55.72`

## Chay local

```bash
npm start
```

Mo:

```bash
curl http://localhost:8080/
curl http://localhost:8080/health
```

## Kiem tra version Node.js cua Beanstalk bang AWS CLI

```bash
aws elasticbeanstalk describe-environments \
  --environment-names Thangnv-beanstalk-env \
  --query 'Environments[0].{EnvironmentName:EnvironmentName,ApplicationName:ApplicationName,PlatformArn:PlatformArn,SolutionStackName:SolutionStackName,Status:Status,Health:Health,EndpointURL:EndpointURL}' \
  --output json
```

Ket qua environment hien tai dang dung Node.js 24, nen `package.json` dat:

```json
"engines": {
  "node": ">=24 <25"
}
```

## Deploy bang AWS CLI

Tao file zip:

```bash
zip -r beanstalk-app.zip . -x '.git/*' 'node_modules/*' 'beanstalk-app.zip'
```

Upload zip len S3 bucket cua ban:

```bash
aws s3 cp beanstalk-app.zip s3://YOUR_BUCKET/beanstalk-app.zip
```

Tao application version:

```bash
aws elasticbeanstalk create-application-version \
  --application-name thangnv-beanstalk \
  --version-label sample-nodejs-24-$(date +%Y%m%d%H%M%S) \
  --source-bundle S3Bucket=YOUR_BUCKET,S3Key=beanstalk-app.zip
```

Cap nhat environment, thay `VERSION_LABEL` bang label vua tao:

```bash
aws elasticbeanstalk update-environment \
  --environment-name Thangnv-beanstalk-env \
  --version-label VERSION_LABEL
```

Sau khi deploy:

```bash
curl http://13.228.55.72/
curl http://13.228.55.72/health
```
