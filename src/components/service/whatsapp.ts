export function whatsappUrl(phone:string,message:string){
 const digits=phone.replace(/\D/g,'');
 if(digits.length<10||digits.length>13)return null;
 const number=digits.length<=11?'55'+digits:digits;
 return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}