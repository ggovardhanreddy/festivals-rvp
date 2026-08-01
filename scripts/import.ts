import {execFileSync} from "node:child_process"; execFileSync('npm',['run','ingest','--',...process.argv.slice(2)],{stdio:'inherit'});
