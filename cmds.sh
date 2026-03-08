kubectl port-forward svc/argocd-server -n argocd 8888:443
kubectl port-forward svc/jenkins -n jenkins 8081:8080

jenkins
h2eDRFhL2q6kuK0EI0rBih

argocd
ZA9Kb53fRSWe3Noo

kubectl create secret docker-registry docker-hub-creds \
  --docker-username=SEU_USUARIO \
  --docker-password=SUA_SENHA \
  --docker-email=SEU_EMAIL \
  -n jenkins

kubectl create secret docker-registry docker-hub-creds \
  --docker-username=andersoncrms \
  --docker-password=anderson.c.rms2005@gmail.com \
  --docker-email=An100605$%! \
  -n jenkins