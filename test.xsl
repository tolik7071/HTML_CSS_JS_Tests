<xs:schema xmlns:xs='http://www.w3.org/2001/XMLSchema'>

   <xs:element name="addresses">
      <xs:complexType>
         <xs:sequence>
            <xs:element ref="address" minOccurs='1' maxOccurs='unbounded'/>
         </xs:sequence>
      </xs:complexType>
   </xs:element>

   <xs:element name="address">
      <xs:complexType>
         <xs:sequence>
            <xs:element ref="name" minOccurs='0' maxOccurs='1'/>
            <xs:element ref="street" minOccurs='0' maxOccurs='1'/>
         </xs:sequence>
      </xs:complexType>
   </xs:element>

   <xs:element name="name" type='xs:string'/>
   <xs:element name="street" type='xs:string'/>
</xs:schema>
