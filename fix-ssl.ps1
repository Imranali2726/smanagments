$ErrorActionPreference = 'Continue'
Set-Location -LiteralPath $PSScriptRoot

Write-Host "`n[check] Who issues the certificate for repo.packagist.org ?" -ForegroundColor Cyan
try {
  $tcp = New-Object Net.Sockets.TcpClient('repo.packagist.org', 443)
  $ssl = New-Object Net.Security.SslStream($tcp.GetStream(), $false, [Net.Security.RemoteCertificateValidationCallback]{ param($a,$b,$c2,$d) $true })
  $ssl.AuthenticateAsClient('repo.packagist.org')
  $c = New-Object Security.Cryptography.X509Certificates.X509Certificate2($ssl.RemoteCertificate)
  Write-Host ("   Issuer : " + $c.Issuer) -ForegroundColor Yellow
  $ssl.Dispose(); $tcp.Close()
} catch { Write-Host ("   Could not connect: " + $_.Exception.Message) -ForegroundColor Red }

Write-Host "`n[export] Building cacert-all.pem from cacert.pem + Windows trusted roots..." -ForegroundColor Cyan
$sb = New-Object Text.StringBuilder
if (Test-Path 'cacert.pem') { [void]$sb.Append([IO.File]::ReadAllText((Join-Path $PSScriptRoot 'cacert.pem'))); [void]$sb.Append("`n") }
$n = 0
foreach ($store in 'Cert:\LocalMachine\Root','Cert:\CurrentUser\Root','Cert:\LocalMachine\CA','Cert:\CurrentUser\CA') {
  Get-ChildItem $store -ErrorAction SilentlyContinue | ForEach-Object {
    [void]$sb.Append("-----BEGIN CERTIFICATE-----`n")
    [void]$sb.Append([Convert]::ToBase64String($_.RawData, 'InsertLineBreaks'))
    [void]$sb.Append("`n-----END CERTIFICATE-----`n")
    $n++
  }
}
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'cacert-all.pem'), $sb.ToString().Replace("`r`n","`n"), (New-Object Text.UTF8Encoding($false)))
Write-Host "   Added $n Windows certificates." -ForegroundColor Green
