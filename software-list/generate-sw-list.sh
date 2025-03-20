# generate the software list
mvn dependency:list -DexcludeTransitive=true -DincludeScope=runtime -DexcludeGroupIds=com.connexta,ddf,org.codice  -pl '!docs,!ui-frontend' | grep -i compile | sort | uniq -u | cut -d ":" -f 2,4 | sed s/:/-/g > ddf-ui-deplist.out
