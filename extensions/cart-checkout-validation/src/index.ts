// const { createHmac } = await import('node:crypto');
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';
import {
  InputQuery,
  FunctionResult,
  FunctionError,
  ProductVariant,
  GateConfiguration
} from "../generated/api";

interface GateContext {
  id: string;
  hmac: string;
}

const getGateContext = (input:InputQuery)=>{
  const val = input.cart.attribute?.value;
  return val ? JSON.parse(val) as GateContext[] : [];
}

const getProductVariants = (input:InputQuery)=>input.cart.lines.reduce((acc, {merchandise})=>{
  if(merchandise.__typename === 'ProductVariant'){
    acc.push(merchandise as ProductVariant);
  }
  return acc;
}, [] as ProductVariant[])


const getHmac = (message:string) => {
  // secret-key will be embedded in the code
  // const hmac = createHmac("sha256", "secret-key");
  // hmac.update(message);
  // return hmac.digest("hex");
  return Base64.stringify(hmacSHA256(message, "secret-key"));
}

const isSignatureValid = async (gateContextItem: GateContext, gateConfiguration:GateConfiguration)=>{
  return getHmac(gateConfiguration.id) === gateContextItem.hmac;
}

export default (input: InputQuery): FunctionResult => {
  const gateContext = getGateContext(input); //[getHmac({id: gateConfigurationGid})] - signed gates id, which user passed
  const productVariants = getProductVariants(input);
  
  const errors: FunctionError[] = [];

  productVariants.forEach(pVariant=>{
    const gates = pVariant.product.gates || [];
    gates.forEach(gate=>{
      const variantGateId = gate.configuration.id.toString();
      const gateContextItem = gateContext.find(({id})=>id === variantGateId);

      //TODO: gate can be unactive
      const gateUnlocked =  gateContextItem && isSignatureValid(gateContextItem, gate.configuration);
      
      if(!gateUnlocked){
        errors.push({
          localizedMessage: `The product: ${pVariant.product.handle} is holder exclusive, to unlock visit product page`,
          target: "cart",
        })
      }
    })
  })

  // const errors: FunctionError[] = productVariants.map(pVariant=>{

  // })

  // const errors: FunctionError[] = input.cart.lines
  //   .filter(({ quantity }) => quantity > 1)
  //   .map(() => ({
  //     localizedMessage: "Not possible to order more than one of each",
  //     target: "cart",
  //   }));

  return {
    errors
  }
};